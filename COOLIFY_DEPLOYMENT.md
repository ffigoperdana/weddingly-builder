# Deploy Weddingly ke Coolify

Panduan ini memakai arsitektur yang paling mudah dirawat untuk homelab:

```text
invitation.fgdev.tech       -> Weddingly Astro app
PostgreSQL Coolify resource -> Prisma database
MinIO + imgproxy Compose    -> storage dan optimasi gambar
```

`docker-compose.yml` di root hanya berisi MinIO, initializer bucket, dan imgproxy. File `docker-compose.local.yml` serta `docker-compose.db.local.yml` hanya untuk laptop; jangan dipakai sebagai Compose production.

## 1. Prasyarat server dan DNS

Pastikan server Coolify dapat diakses dari internet. Untuk homelab di belakang router, forward port TCP `80` dan `443` ke server Coolify. Jika koneksi memakai CGNAT dan tidak punya inbound public IP, gunakan tunnel/reverse proxy yang mendukung domain dan HTTPS.

Buat DNS `A` atau `AAAA` ke alamat server Coolify:

| Hostname | Dipakai untuk |
|---|---|
| `invitation.fgdev.tech` | aplikasi builder dan invitation |
| `media.fgdev.tech` | MinIO S3 API dan file audio |
| `console.fgdev.tech` | MinIO Console; sebaiknya tidak dibuka luas setelah setup |
| `images.fgdev.tech` | imgproxy |

HTTPS akan diterbitkan oleh proxy Coolify setelah DNS sudah mengarah benar. Jangan memakai domain production sebelum DNS resolve dari internet.

## 2. Buat PostgreSQL di Coolify

1. Buat Project, Environment `production`, dan pilih server homelab.
2. Pilih **New Resource -> Database -> PostgreSQL**.
3. Gunakan database, username, dan password yang kuat.
4. Pastikan storage/database volume bersifat persistent.
5. Jangan publish port PostgreSQL ke internet.
6. Salin internal connection string yang diberikan Coolify untuk `DATABASE_URL`.

Jangan gunakan `localhost:5433` di production. `localhost` dari dalam container berarti container aplikasi itu sendiri. Port `5433` adalah mapping PostgreSQL Docker lokal di laptop.

## 3. Deploy MinIO + imgproxy sebagai Compose

1. Buat resource baru dari repository yang sama.
2. Pilih build pack **Docker Compose**.
3. Base directory: `/`.
4. Compose file: `/docker-compose.yml`.
5. Masukkan environment variables berikut di resource Compose:

```env
MINIO_ACCESS_KEY=<random-user>
MINIO_SECRET_KEY=<random-password-yang-panjang>
MINIO_BUCKET=weddingly
MINIO_SERVER_URL=https://media.fgdev.tech
MINIO_BROWSER_REDIRECT_URL=https://console.fgdev.tech
AWS_REGION=us-east-1
IMGPROXY_KEY=
IMGPROXY_SALT=
```

`IMGPROXY_KEY` dan `IMGPROXY_SALT` sengaja kosong untuk versi aplikasi sekarang karena URL imgproxy yang dihasilkan aplikasi belum ditandatangani.

6. Deploy stack.
7. Di bagian domain service Compose, arahkan service seperti ini:

| Service | Domain Coolify | Port container |
|---|---|---:|
| `minio` | `https://media.fgdev.tech:9000` | 9000 |
| `minio` | `https://console.fgdev.tech:9001` | 9001 |
| `imgproxy` | `https://images.fgdev.tech:8080` | 8080 |

Port di belakang domain hanya memberi tahu proxy Coolify port internal yang dituju; URL publik yang dipakai aplikasi tetap tanpa `:9000`, `:9001`, atau `:8080`.

`minio-init` memang one-shot container. Setelah bucket dibuat, statusnya boleh `Exited (0)`; itu bukan tanda upload gagal. Bucket `weddingly` dibuat dan diberi akses download read-only oleh initializer.

## 4. Deploy aplikasi Weddingly

Buat resource aplikasi kedua dari repository dan branch production yang sama:

1. Build pack: **Nixpacks**.
2. Base directory: `/`.
3. Install command: `npm ci`.
4. Build command: `npm run build`.
5. Start command: `npm run start`.
6. Ports Exposes: `4321`.
7. Domain: `https://invitation.fgdev.tech`.
8. Health check: `GET /` pada port `4321`.

`npm run build` sekarang menjalankan `prisma generate` terlebih dahulu. `npm run start` menjalankan `prisma migrate deploy`, lalu menyalakan server Astro standalone di `dist/server/entry.mjs`.

Set environment variables aplikasi di Coolify:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=4321

DATABASE_URL=<internal-connection-string-dari-Coolify-PostgreSQL>
SESSION_SECRET=<random-secret-minimal-32-karakter>

MINIO_ENDPOINT=https://media.fgdev.tech
MINIO_ACCESS_KEY=<nilai-yang-sama-dengan-Compose>
MINIO_SECRET_KEY=<nilai-yang-sama-dengan-Compose>
MINIO_BUCKET=weddingly
PUBLIC_MINIO_URL=https://media.fgdev.tech
PUBLIC_IMGPROXY_URL=https://images.fgdev.tech

# Dipakai hanya saat menjalankan seed pertama kali.
SUPER_ADMIN_EMAIL=admin@owner.me
SUPER_ADMIN_PASSWORD=<password-admin-production-yang-kuat>
```

Karena `prisma.config.ts` membaca `DATABASE_URL` saat dependency/build dipasang, tandai `DATABASE_URL` tersedia pada fase build dan runtime di Coolify. Jangan menampilkan nilainya di log. Untuk deployment yang lebih ketat, gunakan build secret Coolify atau Dockerfile dengan secret mount.

## 5. Migrasi dan akun super admin

Deploy aplikasi. Lihat deployment log dan pastikan baris `prisma migrate deploy` selesai tanpa error.

Setelah container aplikasi sudah hidup, buka terminal resource aplikasi di Coolify dan jalankan satu kali:

```bash
npm run db:seed
```

Dengan `NODE_ENV=production` dan tanpa `ALLOW_DEMO_SEED=true`, seed akan membuat atau memperbarui:

- katalog template `Classic Romance` dan `Autumn Pop-up`;
- super admin `admin@owner.me`;
- tidak membuat akun demo biasa.

Ubah password admin melalui environment variable sebelum menjalankan seed. Jangan biarkan `OwnerAdmin123!` menjadi password production. Seed bersifat idempotent, tetapi setiap eksekusi akan menyetel ulang password admin ke nilai `SUPER_ADMIN_PASSWORD`.

Jika memang perlu membuat user demo sementara, set `ALLOW_DEMO_SEED=true`, `SEED_USER_EMAIL`, dan `SEED_USER_PASSWORD` hanya untuk eksekusi itu, lalu hapus/ubah kembali variable tersebut.

## 6. Smoke test setelah deploy

1. Buka `https://invitation.fgdev.tech/login`.
2. Login sebagai `admin@owner.me`.
3. Pastikan `/admin` bisa dibuka oleh super admin.
4. Buat satu user invitation dari dashboard admin.
5. Pastikan user biasa hanya bisa membuka `/dashboard`, bukan `/admin`.
6. Buat atau edit site dengan template Classic/Autumn.
7. Upload satu gambar dan satu audio; pastikan gambar melalui `images.fgdev.tech` dan audio melalui `media.fgdev.tech`.
8. Publish site lalu buka URL slug invitation.
9. Uji RSVP sebagai guest dan cek hasilnya dari dashboard user.

Jika muncul `502`, `404 No available server`, atau `Gateway timeout`, cek berurutan: container benar-benar listen di `0.0.0.0:4321`, **Ports Exposes** `4321`, health-check path `/`, dan log start command.

## 7. Backup dan keamanan

- Backup PostgreSQL secara terjadwal dan uji restore.
- Backup bucket/volume `minio_data`; backup Coolify sendiri tidak otomatis berarti data volume aplikasi ikut ter-backup.
- Jangan publish PostgreSQL.
- Jangan memakai credential `minioadmin` di production.
- Batasi akses `console.fgdev.tech`; bila memungkinkan gunakan VPN, IP allowlist, atau basic auth tambahan.
- Untuk sekarang jangan mengganti image Compose dari `latest` tanpa rencana; setelah deployment pertama stabil, pin versi image MinIO, `minio/mc`, dan imgproxy supaya redeploy tidak mendapat perubahan tak terduga.
- Simpan secret hanya di Coolify, bukan di `.env` yang di-commit.

## 8. Alur deploy berikutnya

```text
commit/push ke branch production
        |
        v
Coolify build -> npm ci -> npm run build
        |
        v
container start -> prisma migrate deploy -> Astro :4321
        |
        v
https://invitation.fgdev.tech
```

Resource Compose media juga dapat ikut ter-trigger oleh push repository yang sama. Itu aman karena volume MinIO persistent dan initializer idempotent, tetapi untuk menghindari redeploy media setiap ada perubahan UI, nanti media stack dapat dipindahkan ke repository infra terpisah atau auto-deploy-nya dimatikan.

## Referensi resmi

- [Coolify Docker Compose deployments](https://coolify.io/docs/knowledge-base/docker/compose)
- [Coolify environment variables](https://coolify.io/docs/knowledge-base/environment-variables)
- [Coolify health checks](https://coolify.io/docs/knowledge-base/health-checks)
- [Coolify persistent storage](https://coolify.io/docs/knowledge-base/persistent-storage)
- [Coolify databases](https://coolify.io/docs/databases/)
- [Astro Node standalone adapter](https://v5.docs.astro.build/en/guides/integrations-guide/node/)
