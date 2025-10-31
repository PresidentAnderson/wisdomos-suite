# WisdomOS Community Hub 🧠✨

A comprehensive platform for personal growth, emotional processing, and community learning. Built with Next.js 14, TypeScript, Supabase, and modern web technologies.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fwisdomos-community-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

### 🔐 **Complete Authentication System**
- Email/password registration with verification
- Social logins (Google, GitHub)
- Secure JWT-based sessions
- Password reset functionality
- Profile management

### 📊 **Personal Dashboard**
- Comprehensive stats and progress tracking
- Real-time activity feed
- Document overview and quick actions
- Weekly and monthly growth metrics

### 📝 **Document Management**
- **Upset Documentation**: Process emotional upsets systematically
- **Boundary Audit**: Assess and strengthen personal boundaries
- **Fulfillment Display**: Visualize achievements and fulfilling experiences
- Rich text editing and categorization
- Version control and document history

### 🔄 **Real-time Features**
- Live document collaboration
- Instant notifications
- Real-time activity updates
- User presence indicators

### 📈 **Advanced Analytics**
- Detailed engagement metrics
- Activity trend analysis
- Document type distribution
- Export capabilities (CSV, JSON)
- Performance insights

### 👥 **Admin Panel**
- User management and moderation
- Content oversight
- System settings configuration
- Analytics overview
- Role-based access control

### 📱 **Progressive Web App (PWA)**
- Offline functionality
- Install prompts
- Push notifications
- Service worker caching
- Mobile-optimized experience

### 🎯 **Analytics Integration**
- Google Analytics 4
- Google Tag Manager
- Facebook Pixel
- Microsoft Clarity
- Custom event tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wisdomos-community-hub.git
cd wisdomos-community-hub
```

### 2. Install Dependencies

```bash
npm install

# If you encounter peer dependency issues:
npm install --legacy-peer-deps
```

### 3. Set Up Supabase

Follow the detailed [Supabase Setup Guide](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Set up the database schema
- Configure authentication providers
- Enable real-time features

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_ga4_tracking_id
NEXT_PUBLIC_GTM_ID=your_gtm_container_id
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
wisdomos-community-hub/
├── public/                     # Static assets and PWA files
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx          # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI primitives
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Supabase client configuration
│   │   ├── database.ts        # Database operations
│   │   ├── analytics.ts       # Analytics integration
│   │   └── utils.ts           # Utility functions
│   ├── store/                 # State management (Zustand)
│   └── types/                 # TypeScript type definitions
├── supabase-schema.sql        # Database schema
├── SUPABASE_SETUP.md          # Supabase configuration guide
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **API**: Next.js API Routes

### DevOps & Analytics
- **Deployment**: Vercel
- **Analytics**: GA4, GTM, Facebook Pixel, Clarity
- **Monitoring**: Built-in error tracking
- **PWA**: Service Workers, Web App Manifest

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **One-click deploy:**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fwisdomos-community-hub)

2. **Manual deployment:**
   Follow the detailed [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Live Demo](https://community-bv0wj4lil-axaiinovation.vercel.app)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

<div align="center">

**Built with ❤️ for personal growth and wisdom sharing**

[Getting Started](#-quick-start) • [Documentation](#-project-structure) • [Contributing](#-contributing)

</div>
