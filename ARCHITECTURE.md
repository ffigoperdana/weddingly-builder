# Wedding Builder - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │ Login Page   │      │ Admin Page   │                     │
│  │              │      │              │                     │
│  │  AuthForm    │      │  ┌─────────┐ │                     │
│  │  Component   │──────▶  │ Builder │ │                     │
│  │              │      │  │   Tab   │ │                     │
│  └──────────────┘      │  └─────────┘ │                     │
│                        │               │                     │
│                        │  ┌─────────┐ │                     │
│                        │  │  RSVP   │ │                     │
│                        │  │  List   │ │                     │
│                        │  │   Tab   │ │                     │
│                        │  └─────────┘ │                     │
│                        └──────────────┘                     │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │ (Fetch API)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                         SERVER SIDE                          │
│                      (Astro API Routes)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Authentication Routes      Wedding Routes     RSVP Routes   │
│  ┌──────────────────┐     ┌──────────────┐  ┌────────────┐ │
│  │ /api/auth/       │     │ /api/wedding/│  │ /api/rsvp/ │ │
│  │                  │     │              │  │            │ │
│  │ • login          │     │ • site       │  │ • list     │ │
│  │ • register       │     │   (GET/POST) │  │ • export   │ │
│  │ • logout         │     │              │  │            │ │
│  └──────────────────┘     └──────────────┘  └────────────┘ │
│           │                       │                 │        │
│           └───────────────────────┴─────────────────┘        │
│                                   │                          │
│                          ┌────────▼────────┐                 │
│                          │ Auth Middleware │                 │
│                          │  (Session Check)│                 │
│                          └────────┬────────┘                 │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
                                    │ Prisma ORM
                                    │
┌───────────────────────────────────▼──────────────────────────┐
│                        DATABASE LAYER                         │
│                      (PostgreSQL + Prisma)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌────────┐  ┌──────────┐  │
│  │   User   │  │ WeddingSite  │  │  Event │  │   RSVP   │  │
│  ├──────────┤  ├──────────────┤  ├────────┤  ├──────────┤  │
│  │ id       │  │ id           │  │ id     │  │ id       │  │
│  │ email    │──│ userId       │  │ siteId │──│ siteId   │  │
│  │ password │  │ slug         │──│ title  │  │ fullName │  │
│  │          │  │ colors       │  │ date   │  │ email    │  │
│  │          │  │ fonts        │  │ time   │  │ attending│  │
│  │          │  │ hero*        │  │ address│  │ dietary  │  │
│  │          │  │ story*       │  │        │  │ message  │  │
│  │          │  │ gallery*     │  │        │  │          │  │
│  │          │  │ registry*    │  │        │  │          │  │
│  └──────────┘  │ password?    │  └────────┘  └──────────┘  │
│                │ isPublished  │                              │
│                └──────────────┘                              │
│                                                               │
│  Relationships:                                               │
│  • User 1:1 WeddingSite                                      │
│  • WeddingSite 1:N Event                                     │
│  • WeddingSite 1:N RSVP                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Registration/Login Flow

```
┌──────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│ User │─────▶│AuthForm │─────▶│ /api/auth│─────▶│ Database │
└──────┘      │Component│      │/register │      │  (User)  │
              └─────────┘      │ /login   │      └──────────┘
                               └────┬─────┘
                                    │
                              Create Session
                              (Cookie Storage)
                                    │
                                    ▼
                            ┌──────────────┐
                            │ Redirect to  │
                            │ /admin       │
                            └──────────────┘
```

### 2. Wedding Site Builder Flow

```
┌──────┐      ┌────────────┐      ┌──────────────┐      ┌──────────┐
│Couple│─────▶│BuilderForm │─────▶│ /api/wedding │─────▶│ Database │
└──────┘      │            │      │    /site     │      │(Wedding  │
   │          │ • Colors   │      │              │      │  Site +  │
   │          │ • Hero     │      │  Validate    │      │ Events)  │
   │          │ • Events   │      │  Session     │      └────┬─────┘
   │          │ • Story    │      │              │           │
   │          │ • Gallery  │      │  Create/     │           │
   │          │ • Registry │      │  Update      │           │
   │          └────────────┘      └──────────────┘           │
   │                                                          │
   └──────────────────────────────────────────────────────────┘
                        Success Response
                    (Updated Wedding Site)
```

### 3. RSVP Management Flow

```
┌──────┐      ┌──────────┐      ┌────────────┐      ┌──────────┐
│Couple│─────▶│RSVPList  │─────▶│ /api/rsvp  │─────▶│ Database │
└──────┘      │Component │      │   /list    │      │  (RSVP)  │
              │          │      │            │      └────┬─────┘
              │ View     │◀─────│  Fetch     │           │
              │ Export   │      │  Analytics │◀──────────┘
              └────┬─────┘      │            │
                   │            └──────┬─────┘
                   │                   │
                   │ Export            │
                   ▼                   │
              ┌──────────┐            │
              │/api/rsvp │◀───────────┘
              │ /export  │
              │          │
              │Generate  │
              │  CSV     │
              └────┬─────┘
                   │
                   ▼
              Download File
```

## Component Hierarchy

```
AdminDashboard (Container)
│
├── Header
│   ├── Title & URL Display
│   └── Logout Button
│
├── Tab Navigation
│   ├── Builder Tab
│   └── RSVP List Tab
│
└── Content Area
    │
    ├── [Builder Tab Active]
    │   │
    │   └── BuilderForm
    │       ├── Global Style Editor
    │       │   ├── Color Pickers (3)
    │       │   └── Font Inputs (2)
    │       │
    │       ├── Hero Section
    │       │   ├── Name Inputs (2)
    │       │   ├── Date Picker
    │       │   └── Image URL Input
    │       │
    │       ├── Event Details
    │       │   └── Event[] (Dynamic)
    │       │       ├── Title Input
    │       │       ├── Date Picker
    │       │       ├── Time Input
    │       │       ├── Location Input
    │       │       └── Address Input
    │       │
    │       ├── Our Story Section
    │       │   ├── Title Input
    │       │   ├── Story Textarea
    │       │   └── Image URLs (2)
    │       │
    │       ├── Photo Gallery
    │       │   ├── Title Input
    │       │   └── Image URLs (max 10)
    │       │
    │       ├── Gift Registry
    │       │   ├── Title Input
    │       │   └── Registry Textarea
    │       │
    │       ├── Publishing Settings
    │       │   ├── Slug Input
    │       │   └── Password Input
    │       │
    │       └── Action Buttons
    │           ├── Save Draft
    │           └── Publish
    │
    └── [RSVP List Tab Active]
        │
        └── RSVPList
            ├── Analytics Cards (3)
            │   ├── Total RSVPs
            │   ├── Attending
            │   └── Declined
            │
            ├── Export Button
            │
            └── RSVP Table
                ├── Headers
                └── Rows[] (Dynamic)
                    ├── Name
                    ├── Email
                    ├── Status Badge
                    ├── Dietary Info
                    ├── Message
                    └── Timestamp
```

## Session & Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication States                 │
└─────────────────────────────────────────────────────────┘

┌──────────────┐
│ User visits  │
│    /         │
└──────┬───────┘
       │
       ▼
┌──────────────┐      No Session     ┌───────────────┐
│ Check Cookie │─────────────────────▶│ Redirect to   │
│  (session)   │                      │    /login     │
└──────┬───────┘                      └───────────────┘
       │                                      │
       │ Has Session                          │
       │                                      ▼
       ▼                              ┌───────────────┐
┌──────────────┐                      │  Login/       │
│ Redirect to  │                      │  Register     │
│   /admin     │◀─────────────────────│  Form         │
└──────────────┘     After Login      └───────────────┘
       │
       │
       ▼
┌──────────────┐
│ Admin        │
│ Dashboard    │
│              │
│ Every API    │
│ call checks  │
│ session      │
└──────────────┘
```

## API Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Request Lifecycle                     │
└─────────────────────────────────────────────────────────┘

Client Request
      │
      ▼
┌─────────────────┐
│ API Endpoint    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     No Session    ┌──────────────┐
│ requireAuth()   │───────────────────▶│ 401 Error    │
│ Middleware      │                    │ Unauthorized │
└────────┬────────┘                    └──────────────┘
         │
         │ Valid Session
         │
         ▼
┌─────────────────┐
│ Extract userId  │
│ from Session    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database Query  │
│ (filtered by    │
│  userId)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return Data     │
│ (200 OK)        │
└─────────────────┘
```

## File Upload Strategy

```
Current: MinIO + imgproxy (self-hosted Docker Compose media stack)
┌──────┐      ┌────────────┐      ┌────────────┐      ┌──────────┐
│ User │─────▶│ Upload File│─────▶│   MinIO    │─────▶│ Get URL  │
└──────┘      │ (Browser)  │      │ (Your VPS) │      │ Store in │
              └────────────┘      └────────────┘      │    DB    │
                                                       └──────────┘

Media Stack Components:
┌─────────────────────────────────────────────────────────┐
│                   Media Storage Stack                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐   ┌─────────────┐                      │
│  │  imgproxy   │   │    MinIO    │                      │
│  │ (Processing)│◀──│  (Storage)  │                      │
│  └─────────────┘   └─────────────┘                      │
│                                                          │
│  Features:                                               │
│  • On-the-fly image transformations                     │
│  • WebP/AVIF format conversion                          │
│  • S3-compatible object storage                         │
│  • URL-based processing parameters                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend

- **Astro**: Server-side rendering, routing
- **React**: Interactive components
- **TailwindCSS**: Styling
- **shadcn/ui**: Pre-built components

### Backend

- **Astro API Routes**: RESTful endpoints
- **Prisma ORM**: Database abstraction
- **PostgreSQL**: Relational database

### Media Storage

- **MinIO**: S3-compatible object storage (self-hosted)
- **imgproxy**: On-the-fly image processing (resize, crop, format conversion)
- **ARM64 compatible**: Works on Oracle Cloud free tier

### Authentication

- **Session-based**: Cookie storage
- **SHA-256**: Password hashing
- **HttpOnly cookies**: XSS protection

### State Management

- **React useState**: Component state
- **useEffect**: Data fetching
- **Server state**: Database as source of truth

---

This architecture provides a solid foundation for the wedding website builder with clear separation of concerns, security, scalability, and full on-premise deployment capability.
