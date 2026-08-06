# The Evermore - Wedding Website Builder

A beautiful, simple, and efficient wedding website builder that allows couples to create stunning single-page wedding sites with RSVP management. Built with Astro, React, Tailwind CSS, and Prisma.

## ✨ Features

### For Couples (User Dashboard)

- 🎨 **Visual Builder** - Single-page builder with intuitive section-based editing
- 🎭 **Customization** - Global color palette and font selection
- 📸 **Media Management** - Image and audio upload via MinIO + imgproxy (self-hosted)
- 🎵 **Background Music** - Upload custom music for guest pages
- 🎫 **RSVP Management** - View, track, and export guest responses
- 🔒 **Password Protection** - Optional password for guest access
- 🌐 **Unique URLs** - Each wedding gets a custom shareable link

### For Guests (Wedding Website)

- 📱 **Mobile-First Design** - Optimized for all devices
- 💌 **Envelope Animation** - Beautiful entrance with envelope opening
- 🎵 **Background Music** - Automatic music playback on interaction
- 📅 **Event Details** - Clear display of ceremony and reception info
- 📍 **Google Maps Integration** - Easy location navigation
- 💝 **RSVP Form** - Simple form with dietary restrictions
- 🖼️ **Photo Gallery** - Carousel display of couple's photos
- ❤️ **Love Story** - Share your journey with guests
- 🎁 **Gift Registry** - Links to registries or bank details

## 🚀 Tech Stack

- **Framework**: [Astro 5.14](https://astro.build) - Ultra-fast static site generator
- **UI Library**: [React 19](https://react.dev) - For interactive components
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com) - Utility-first CSS
- **Database**: [Prisma 6.18](https://prisma.io) with PostgreSQL
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- **Form Management**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- **Media Storage**: [MinIO](https://min.io) + [imgproxy](https://imgproxy.net) - Self-hosted S3-compatible storage with on-the-fly image processing
- **UI Components**: [Radix UI](https://radix-ui.com) - Accessible component primitives
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful icon set

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (local or hosted on your VPS)
- Docker Compose (MinIO + imgproxy media stack) - deployable from Coolify or locally

## 🛠️ Installation

1. **Clone the repository**

```sh
git clone https://github.com/dannycahyo/weddingly-builder.git
cd weddingly-builder
```

2. **Install dependencies**

```sh
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/weddingly"

# Session
SESSION_SECRET="your-random-secret-key"

# MinIO (S3-compatible storage)
# Local Compose: http://localhost:9000
# Separate Coolify app: https://media.your-domain.com
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET="weddingly"
PUBLIC_MINIO_URL="http://localhost:9000"

# imgproxy (image processing)
PUBLIC_IMGPROXY_URL="http://localhost:8080"
```

4. **Set up the database**

```sh
npx prisma migrate dev
# or
bunx prisma migrate dev
```

5. **Seed the database (optional)**

```sh
npx prisma db seed
# or
bunx prisma db seed
```

The configured local seed creates these development-only accounts:

```text
Super admin email: admin@owner.me
Super admin password: OwnerAdmin123!

Demo user email: demo@weddingly.local
Demo user password: WeddinglyDemo123!
```

The seed refuses to run when `NODE_ENV=production` unless it is explicitly overridden with `ALLOW_DEMO_SEED=true`.

## 🏃 Development

Start the development server:

```sh
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:4321` (or the next available port).

## 📦 Build

Build for production:

```sh
npm run build
# or
bun run build
```

Preview the production build:

```sh
npm run preview
# or
bun run preview
```

## 🗄️ Database Management

### Run migrations

```sh
npx prisma migrate dev
```

### Open Prisma Studio (Database GUI)

```sh
npx prisma studio
```

### Generate Prisma Client

```sh
npx prisma generate
```

## 📁 Project Structure

```
weddingly-builder/
├── src/
│   ├── components/
│   │   ├── guest/              # Guest-facing components
│   │   │   ├── EnvelopeInvitation.tsx
│   │   │   ├── GuestPage.tsx
│   │   │   ├── MusicPlayer.tsx
│   │   │   └── ...
│   │   ├── sections/           # Admin builder sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── MusicSection.tsx
│   │   │   └── ...
│   │   ├── ui/                 # Reusable UI components
│   │   ├── AudioUpload.tsx     # Audio file uploader
│   │   ├── BuilderForm.tsx     # Main admin form
│   │   └── ...
│   ├── layouts/
│   │   └── main.astro          # Main layout
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── utils.ts            # Utility functions
│   │   └── validations.ts      # Zod schemas
│   ├── pages/
│   │   ├── api/                # API endpoints
│   │   │   ├── upload.ts       # MinIO file upload
│   │   │   ├── wedding/        # Wedding CRUD
│   │   │   └── rsvp.ts         # RSVP submission
│   │   ├── builder.astro       # Admin builder page
│   │   ├── [slug].astro        # Dynamic wedding pages
│   │   └── index.astro         # Landing page
│   └── styles/
│       └── global.css          # Global styles
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── docs/
│   └── PRD.md                  # Product Requirements
├── astro.config.mjs            # Astro configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

## 🎨 Key Features Implementation

### Background Music

- Upload audio files (MP3, WAV, M4A, OGG) via MinIO
- Automatic playback on user interaction (envelope opening)
- Floating music player with play/pause and mute controls
- Displays song title and artist

### Envelope Animation

- Beautiful entrance animation for guest pages
- Personalized greeting with guest name
- Smooth transition to main content
- Framer Motion powered animations

### RSVP Management

- Guest form with name, attendance, and dietary restrictions
- Admin dashboard to view all responses
- Quick stats (attending, declined)
- CSV export functionality

### Customization

- Choose from 10 color palettes
- Select heading and body fonts
- Toggle sections on/off
- Upload unlimited photos to gallery

## 🔐 Security

- Password-protected wedding sites (optional)
- Server-side validation with Zod
- Secure file uploads via MinIO + imgproxy (self-hosted)
- PostgreSQL with Prisma for data safety
- Full on-premise deployment support

## 🌐 Deployment

This project can be deployed to any Node.js hosting platform:

- **Coolify** (Recommended for full on-premise)
- **Vercel**
- **Netlify**
- **Railway**
- **Render**

Make sure to:

1. Set up environment variables
2. Configure PostgreSQL database
3. Create PostgreSQL as a separate Coolify database resource
4. Deploy the complete Weddingly + MinIO + imgproxy stack from [`docker-compose.yml`](./docker-compose.yml)
5. Follow [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md); the production start command runs `prisma migrate deploy` automatically

## 📖 Documentation

- [Product Requirements](./docs/PRD.md)
- [Coolify Deployment Tutorial](./COOLIFY_DEPLOYMENT.md)
- [Media Storage Setup Guide](./MEDIA_STORAGE_SETUP.md)
- [Admin Setup Guide](./ADMIN_SETUP.md)
- [Quick Start Guide](./QUICKSTART.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own wedding or commercial purposes.

## 💖 Created with Love

Built with ❤️ for couples around the world.

---

**The Evermore** - Because every love story deserves a beautiful beginning.
