# Media Storage Setup Guide (MinIO + imgproxy)

Weddingly stores uploaded images and audio in MinIO and uses imgproxy to resize and optimize images on demand.

## Architecture

```text
Weddingly upload API -> MinIO bucket
                    -> imgproxy -> optimized image URL
                    -> public MinIO URL -> audio files
```

- MinIO is the S3-compatible object store.
- imgproxy reads images from MinIO and serves transformed versions.
- Audio files are served directly from MinIO because the current app returns direct audio URLs.
- The repository root contains the deployable stack in `docker-compose.yml`.

## Docker Compose Deployment (Coolify Recommended)

The Compose stack deploys MinIO, a one-time bucket initializer, and imgproxy together. It uses a named `minio_data` volume, so uploads survive container recreation and normal redeployments.

### Deploy from GitHub in Coolify

1. Push this repository to GitHub.
2. In Coolify, create a new resource from the repository.
3. Select **Docker Compose** as the build pack.
4. Set the base directory to `/` and the Compose file to `/docker-compose.yml`.
5. Add these environment variables to the Coolify resource:

```env
MINIO_ACCESS_KEY=replace-with-a-long-random-user
MINIO_SECRET_KEY=replace-with-a-long-random-password
MINIO_BUCKET=weddingly

# Public URLs used by MinIO behind Coolify's proxy
MINIO_SERVER_URL=https://media.example.com
MINIO_BROWSER_REDIRECT_URL=https://console.example.com

# Keep these empty until application-side URL signing is enabled.
IMGPROXY_KEY=
IMGPROXY_SALT=
```

6. Deploy the stack.
7. Assign domains to the Compose services. Include the container port in each Coolify domain so the proxy knows where to route:

| Service | Coolify domain | Purpose |
|---|---|---|
| `minio` | `https://media.example.com:9000` | S3 API and public object URLs |
| `minio` | `https://console.example.com:9001` | MinIO Console |
| `imgproxy` | `https://images.example.com:8080` | Optimized image URLs |

The Compose file intentionally uses `expose` instead of host-port mappings. Coolify's proxy publishes only the domains you assign, while the containers communicate privately over the Compose network.

### Configure the Weddingly app

When the app is a separate Coolify resource, use the public MinIO API domain. The hostname `minio` only works from another container in this same Compose stack or from a resource connected to the same Docker network.

```env
MINIO_ENDPOINT=https://media.example.com
MINIO_ACCESS_KEY=replace-with-a-long-random-user
MINIO_SECRET_KEY=replace-with-a-long-random-password
MINIO_BUCKET=weddingly
PUBLIC_MINIO_URL=https://media.example.com
PUBLIC_IMGPROXY_URL=https://images.example.com
```

If you deliberately attach the Weddingly app to the same Coolify network, the server-side endpoint can instead be the internal service URL, for example `http://minio:9000`. Keep `PUBLIC_MINIO_URL` and `PUBLIC_IMGPROXY_URL` set to public HTTPS domains because browsers need to load the returned media URLs.

### Run locally

Copy `.env.example` to `.env`, then use the local override to bind the services to localhost:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.local.yml up -d
```

Local endpoints:

- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- imgproxy: `http://localhost:8080`

### Optional local PostgreSQL

The root Compose file does not start PostgreSQL by default. For local development, add the opt-in database override and keep the production `DATABASE_URL` separate:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.db.local.yml up -d
```

The local database is available at `postgresql://postgres:postgres@localhost:5433/weddingly`. The example variables are in `.env.docker.example`; do not replace a production or managed-database URL accidentally. Apply the Prisma migrations to the database selected by `DATABASE_URL`:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/weddingly"
npx prisma migrate deploy
```

For Coolify production, keep using the managed/external PostgreSQL URL and run `prisma migrate deploy` against that production database during deployment. Compose only supplies the database server; Prisma migrations still need to be applied to whichever database the app uses.

Stop the local stack with:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.local.yml down
```

The bucket initializer is idempotent. If it needs to be run again manually:

```bash
docker compose --env-file .env -f docker-compose.yml -f docker-compose.local.yml run --rm minio-init
```

## Environment Variables

### Weddingly application

| Variable | Description | Example |
|---|---|---|
| `MINIO_ENDPOINT` | Server-side S3 endpoint used for uploads | `https://media.example.com` |
| `MINIO_ACCESS_KEY` | MinIO root/access key | `random-user` |
| `MINIO_SECRET_KEY` | MinIO root/secret key | `random-password` |
| `MINIO_BUCKET` | Bucket for Weddingly media | `weddingly` |
| `PUBLIC_MINIO_URL` | Public base URL for direct object access | `https://media.example.com` |
| `PUBLIC_IMGPROXY_URL` | Public base URL for optimized images | `https://images.example.com` |

### Compose stack

| Variable | Description | Default |
|---|---|---|
| `MINIO_SERVER_URL` | Public MinIO API URL used in redirects | empty |
| `MINIO_BROWSER_REDIRECT_URL` | Public MinIO Console URL | empty |
| `AWS_REGION` | Region passed to the S3 client and imgproxy | `us-east-1` |
| `IMGPROXY_CONCURRENCY` | Maximum concurrent image processing jobs | `10` |
| `IMGPROXY_MAX_SRC_RESOLUTION` | Maximum source megapixels | `50` |
| `IMGPROXY_MAX_SRC_FILE_SIZE` | Maximum source size in bytes | `10485760` |
| `IMGPROXY_PREFERRED_FORMATS` | Preferred output formats | `webp,avif,jpeg` |

## How the upload flow works

1. An authenticated user uploads an image or audio file through Weddingly.
2. The API validates the file type and 10 MB size limit.
3. The API uploads the file to the `weddingly` MinIO bucket using the AWS S3 SDK.
4. Images receive an imgproxy URL backed by the internal `s3://weddingly/...` source.
5. Audio files receive a direct MinIO URL.

## Security notes

- Use a long random `MINIO_SECRET_KEY`; never keep the example value in production.
- The Compose initializer sets the bucket to read-only public downloads because the current audio implementation uses direct browser URLs. Uploads still require the MinIO credentials held by the server.
- Do not set `IMGPROXY_KEY` or `IMGPROXY_SALT` yet. The current URL helper emits unsigned URLs, so enabling imgproxy signing before the application generates matching signatures will make image requests fail. Add signing as a separate application change before enabling those variables.
- MinIO standalone mode with one volume is appropriate for this small deployment, but it is not a highly available storage cluster. Back up the `minio_data` volume before production migrations or server changes.

## Troubleshooting

### Check MinIO

```bash
curl http://localhost:9000/minio/health/live
docker compose ps
docker compose logs minio
```

### Check imgproxy

```bash
curl http://localhost:8080/health
docker compose logs imgproxy
```

### Common errors

| Error | Cause | Fix |
|---|---|---|
| `NoSuchBucket` | The initializer did not run or the bucket name differs | Run `docker compose run --rm minio-init` and verify `MINIO_BUCKET` |
| `AccessDenied` | Wrong credentials or bucket policy | Check the app credentials and the `minio-init` logs |
| `S3 connection failed` | imgproxy cannot resolve MinIO | Keep `IMGPROXY_S3_ENDPOINT` as `http://minio:9000` inside the Compose stack |
| Browser cannot load media | Public URL/domain is wrong | Check `PUBLIC_MINIO_URL`, `PUBLIC_IMGPROXY_URL`, and Coolify service domains |

## Useful links

- [MinIO container documentation](https://min.io/docs/minio/container/index.html)
- [imgproxy installation](https://docs.imgproxy.net/latest/installation)
- [imgproxy S3 image sources](https://docs.imgproxy.net/latest/image_sources/amazon_s3)
- [Coolify Docker Compose deployments](https://coolify.io/docs/knowledge-base/docker/compose)
