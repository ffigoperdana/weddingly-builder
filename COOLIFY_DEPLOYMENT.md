# Deploy Weddingly ke Coolify

Panduan ini memakai arsitektur yang paling mudah dirawat untuk homelab:

```text
PostgreSQL Coolify resource -> Prisma database
Weddingly Docker Compose    -> app + MinIO + imgproxy
```

`docker-compose.yml` di root berisi service Weddingly, MinIO, initializer bucket, dan imgproxy. File `docker-compose.local.yml` serta `docker-compose.db.local.yml` hanya untuk laptop; jangan dipakai sebagai Compose production.

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
6. Database `wedding` sudah dibuat dengan owner `wedding_user`, jadi gunakan user tersebut untuk aplikasi. Nama resource boleh tetap seperti `postgresql-database-...`; yang dipakai aplikasi adalah nama database di bagian akhir URL.
7. Salin internal connection string yang diberikan Coolify untuk `DATABASE_URL`, lalu ganti username menjadi `wedding_user` dan pastikan bagian akhirnya menggunakan `/wedding`.

Jangan gunakan `localhost:5433` di production. `localhost` dari dalam container berarti container aplikasi itu sendiri. Port `5433` adalah mapping PostgreSQL Docker lokal di laptop.

Jika resource PostgreSQL sudah terlanjur running dengan database awal `postgres`, jangan menghapus volume hanya untuk mengganti nama database. Buka tab **Terminal** pada resource PostgreSQL dan buat database baru:

```bash
psql -U postgres -d postgres -c "CREATE DATABASE wedding;"
```

Jika database `wedding` sudah ada, perintah tersebut akan gagal dengan pesan duplicate database tetapi data tetap aman. Setelah itu gunakan URL yang sama seperti di Coolify, hanya database terakhirnya menjadi `wedding`, contohnya:

```env
DATABASE_URL=postgresql://wedding_user:<password>@<internal-postgres-host>:5432/wedding
```

## 3. Deploy full stack Weddingly sebagai Compose

1. Buat satu resource baru dari repository yang sama. Resource ini akan berisi app Weddingly, MinIO, initializer bucket, dan imgproxy.
2. Pilih build pack **Docker Compose**.
3. Base directory: `/`.
4. Compose file: `/docker-compose.yml`.
5. Aktifkan **Connect to Predefined Network** pada resource Compose agar service `weddingly` dapat menjangkau PostgreSQL resource yang berada di stack berbeda.
6. Masukkan environment variables berikut di resource Compose:

```env
DATABASE_URL=postgresql://wedding_user:<password>@<internal-postgres-host>:5432/wedding
SESSION_SECRET=<random-secret-minimal-32-karakter>

MINIO_ACCESS_KEY=<random-user>
MINIO_SECRET_KEY=<random-password-yang-panjang>
MINIO_BUCKET=weddingly
MINIO_ENDPOINT=http://minio:9000
PUBLIC_MINIO_URL=https://media.fgdev.tech
PUBLIC_IMGPROXY_URL=https://images.fgdev.tech

MINIO_SERVER_URL=https://media.fgdev.tech
MINIO_BROWSER_REDIRECT_URL=https://console.fgdev.tech
AWS_REGION=us-east-1
IMGPROXY_KEY=
IMGPROXY_SALT=

SUPER_ADMIN_EMAIL=admin@owner.me
SUPER_ADMIN_PASSWORD=<password-admin-production-yang-kuat>
```

`IMGPROXY_KEY` dan `IMGPROXY_SALT` sengaja kosong untuk versi aplikasi sekarang karena URL imgproxy yang dihasilkan aplikasi belum ditandatangani.

7. Deploy stack.
8. Di bagian domain service Compose, arahkan service seperti ini:

| Service | Domain Coolify | Port container |
|---|---|---:|
| `weddingly` | `https://invitation.fgdev.tech:4321` | 4321 |
| `minio` | `https://media.fgdev.tech:9000` | 9000 |
| `minio` | `https://console.fgdev.tech:9001` | 9001 |
| `imgproxy` | `https://images.fgdev.tech:8080` | 8080 |

Port di belakang domain hanya memberi tahu proxy Coolify port internal yang dituju; URL publik yang dipakai aplikasi tetap tanpa `:9000`, `:9001`, atau `:8080`.

`minio-init` memang one-shot container. Setelah bucket dibuat, statusnya boleh `Exited (0)`; itu bukan tanda upload gagal. Bucket `weddingly` dibuat dan diberi akses download read-only oleh initializer.

Service `weddingly` mengakses MinIO secara internal melalui `http://minio:9000`. Browser tetap memakai `media.fgdev.tech` dan `images.fgdev.tech` dari environment variable public. PostgreSQL tidak dijalankan oleh Compose ini; koneksinya datang dari resource PostgreSQL Coolify melalui `DATABASE_URL`.

## 4. Migrasi dan akun super admin

Deploy resource Compose. Lihat deployment log service `weddingly` dan pastikan baris `prisma migrate deploy` selesai tanpa error.

Setelah service `weddingly` sudah hidup, buka terminal service tersebut di resource Compose dan jalankan satu kali:

```bash
npm run db:seed
```

Dengan `NODE_ENV=production` dan tanpa `ALLOW_DEMO_SEED=true`, seed akan membuat atau memperbarui:

- katalog template `Classic Romance` dan `Autumn Pop-up`;
- super admin `admin@owner.me`;
- tidak membuat akun demo biasa.

Ubah password admin melalui environment variable sebelum menjalankan seed. Jangan biarkan `OwnerAdmin123!` menjadi password production. Seed bersifat idempotent, tetapi setiap eksekusi akan menyetel ulang password admin ke nilai `SUPER_ADMIN_PASSWORD`.

Jika memang perlu membuat user demo sementara, set `ALLOW_DEMO_SEED=true`, `SEED_USER_EMAIL`, dan `SEED_USER_PASSWORD` hanya untuk eksekusi itu, lalu hapus/ubah kembali variable tersebut.

## 5. Smoke test setelah deploy

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

## 6. Backup dan keamanan

- Backup PostgreSQL secara terjadwal dan uji restore.
- Backup bucket/volume `minio_data`; backup Coolify sendiri tidak otomatis berarti data volume aplikasi ikut ter-backup.
- Jangan publish PostgreSQL.
- Jangan memakai credential `minioadmin` di production.
- Batasi akses `console.fgdev.tech`; bila memungkinkan gunakan VPN, IP allowlist, atau basic auth tambahan.
- Untuk sekarang jangan mengganti image Compose dari `latest` tanpa rencana; setelah deployment pertama stabil, pin versi image MinIO, `minio/mc`, dan imgproxy supaya redeploy tidak mendapat perubahan tak terduga.
- Simpan secret hanya di Coolify, bukan di `.env` yang di-commit.

## 7. Alur deploy berikutnya

```text
commit/push ke branch production
        |
        v
Coolify Compose build -> npm ci -> npm run build
        |
        v
Weddingly start -> prisma migrate deploy -> Astro :4321
        |
        v
https://invitation.fgdev.tech
```

Satu resource Compose akan me-redeploy app dan media stack bersama-sama pada setiap push. Itu memang trade-off yang dipilih agar deployment dan debugging tetap sederhana; volume MinIO tetap persistent dan initializer idempotent.

## Referensi resmi

- [Coolify Docker Compose deployments](https://coolify.io/docs/knowledge-base/docker/compose)
- [Coolify environment variables](https://coolify.io/docs/knowledge-base/environment-variables)
- [Coolify health checks](https://coolify.io/docs/knowledge-base/health-checks)
- [Coolify persistent storage](https://coolify.io/docs/knowledge-base/persistent-storage)
- [Coolify databases](https://coolify.io/docs/databases/)
- [Astro Node standalone adapter](https://v5.docs.astro.build/en/guides/integrations-guide/node/)
