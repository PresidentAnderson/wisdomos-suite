# Installation Guide

Complete installation instructions for WisdomOS.

## System Requirements

### Minimum Requirements
- **OS**: macOS, Linux, or Windows with WSL2
- **Node.js**: 18.x or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free space

### Recommended Tools
- **pnpm**: Faster than npm, optimized for monorepos
- **VS Code**: With recommended extensions
- **Docker**: For containerized development (optional)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wisdomos.git
cd wisdomos
```

### 2. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

Or use alternative methods:
```bash
# macOS/Linux (Homebrew)
brew install pnpm

# Windows (Scoop)
scoop install pnpm
```

### 3. Install Dependencies

```bash
# Install all dependencies across the monorepo
pnpm install
```

This installs dependencies for:
- Web application (Next.js)
- API server (NestJS)
- Mobile app (React Native)
- All shared packages

### 4. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional: HubSpot Integration
HUBSPOT_API_KEY=your-hubspot-api-key
HUBSPOT_WEBHOOK_SECRET=your-webhook-secret
```

See [Configuration Guide](./configuration.md) for detailed environment setup.

### 5. Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data (optional but recommended)
pnpm db:seed:demo
```

The demo seed creates:
- Sample users
- Example journal entries
- Pre-filled life areas
- Sample contributions

### 6. Start Development Servers

```bash
# Start all services in parallel
pnpm dev
```

This starts:
- **Web**: http://localhost:3011
- **API**: Auto-discovered port (check console output)
- **Database**: Connects to Supabase

## Verify Installation

### 1. Check Web Application

Open http://localhost:3011 in your browser. You should see:
- Phoenix logo with flame animation
- Onboarding flow
- Dashboard with life areas

### 2. Check API Server

The API server logs will show:
```
[NestJS] Server running on http://localhost:8080
[NestJS] tRPC endpoints available at /trpc
```

### 3. Check Database Connection

```bash
# Open Prisma Studio to verify database
pnpm db:studio
```

This opens a GUI at http://localhost:5555 showing your database tables.

## Individual App Installation

If you want to run apps individually:

### Web App Only
```bash
cd apps/web
pnpm install
pnpm dev
```

### API Server Only
```bash
cd apps/api
pnpm install
pnpm dev
```

### Mobile App Only
```bash
cd apps/mobile
pnpm install
pnpm mobile:dev
```

## Docker Installation (Alternative)

For containerized development:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Docker setup includes:
- Web application container
- API server container
- PostgreSQL database container
- Nginx reverse proxy

## VS Code Setup

Recommended extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## Troubleshooting

### Port Already in Use

If port 3011 is already in use:
```bash
# Kill process on port 3011
lsof -ti:3011 | xargs kill -9

# Or change the port in package.json
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Database Connection Errors

1. Verify Supabase project is active
2. Check DATABASE_URL is correct
3. Ensure IP allowlist includes your address (Supabase dashboard)

### Prisma Generation Fails

```bash
# Clean and regenerate
rm -rf node_modules/.prisma
pnpm db:generate
```

## Next Steps

Now that installation is complete:

1. [Configure your environment](./configuration.md)
2. [Take your first steps](./first-steps.md)
3. [Learn development workflow](../guides/development/README.md)

## Platform-Specific Notes

### macOS

Install Xcode Command Line Tools if needed:
```bash
xcode-select --install
```

### Linux

Install build essentials:
```bash
sudo apt-get install build-essential
```

### Windows (WSL2)

Ensure WSL2 is set up:
```powershell
wsl --install
wsl --set-default-version 2
```

## Updating

To update to the latest version:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pnpm install

# Run migrations
pnpm db:migrate

# Restart servers
pnpm dev
```

---

**Installation complete?** Continue to [Configuration](./configuration.md) →
