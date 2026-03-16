# MADE Laboratory 

Screen printing shop management system built with Next.js 16.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite (dev) / MySQL (production) with Prisma ORM
- **UI**: Shadcn UI + Tailwind CSS v4
- **Auth**: NextAuth.js v5 with JWT + Google OAuth
- **Language**: TypeScript
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn (comes with Node.js via corepack)

### Installation

```bash
# Clone the repository
git clone https://github.com/MadeLabDev/madeapp.git
cd print-shop

# Install dependencies with yarn
yarn install

# Setup environment variables
cp .env.sample .env
# Edit .env with your configuration

# Setup database
yarn db:generate
yarn db:migrate
yarn db:seed

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

### Development
```bash
yarn dev              # Start dev server (with dev mode)
yarn dev:prod-mode    # Start dev server (without dev features)
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint
```

### Database
```bash
yarn db:generate      # Generate Prisma Client
yarn db:migrate       # Run migrations
yarn db:seed          # Seed database with demo data
yarn db:reset         # Reset database (drop + migrate + seed)
yarn db:studio        # Open Prisma Studio
```

### Testing
```bash
yarn test:email       # Test SMTP email connection
yarn test:create-user # Create test user in database
```

## Demo Accounts

After running `yarn db:seed`, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | baonguyenyam@gmail.com | password123 |
| Manager | manager@madelab.io | password123 |
| Sales | sales@madelab.io | password123 |
| Designer | designer@madelab.io | password123 |
| Inventory | inventory@madelab.io | password123 |
| Multi-role | multi@madelab.io | password123 |

## Development Mode

Set `NEXT_PUBLIC_DEV_MODE="true"` in `.env` to enable:
- Demo accounts panel on login page
- Development tools and features

See [docs/dev-mode.md](docs/dev-mode.md) for details.

## Project Structure

```
print-shop/
├── .github/               # GitHub configuration and documentation
│   └── project-outline.md # MADE (OS) project requirements
├── app/                   # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── access-denied/ # Access denied page
│   │   ├── actions/       # Server actions
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   └── styles/       # Dashboard-specific styles
│   ├── auth/             # Authentication pages
│   ├── error.tsx         # Error boundary
│   ├── global-error.tsx  # Global error page
│   ├── globals.css       # Global styles
│   ├── icon.tsx          # App icon
│   ├── layout.tsx        # Root layout
│   ├── loading.tsx       # Loading page
│   ├── not-found.tsx     # 404 page
│   └── page.tsx          # Home page
├── backups/              # Database backups
├── components/           # React components
│   ├── blocks/           # Reusable component blocks
│   ├── dialogs/          # Modal dialogs
│   ├── editor/           # Rich text editor components
│   ├── form-fields/      # Form field components
│   ├── knowledge/        # Knowledge base components
│   ├── list-page/        # List page components
│   ├── media/            # Media management components
│   ├── module-form/      # Dynamic form components
│   ├── pagination/       # Pagination components
│   ├── providers/        # Context providers
│   ├── ui/               # Shadcn UI components
│   ├── dev/              # Development-only components
│   ├── shadcn-editor-wrapper.tsx
│   └── theme-toggle.tsx  # Theme toggle component
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and business logic
│   ├── auth.ts           # Authentication utilities
│   ├── cors.ts           # CORS configuration
│   ├── index.ts          # Main exports
│   ├── initialize-backup.ts
│   ├── initialize-settings.ts
│   ├── permissions.ts    # Permission utilities
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # General utilities
│   ├── config/           # Configuration files
│   ├── contexts/         # React contexts
│   ├── email/            # Email service and templates
│   ├── features/         # Feature modules (CRM, knowledge, etc.)
│   ├── hooks/            # Additional hooks
│   ├── realtime/         # Real-time features
│   ├── storage/          # File storage utilities
│   └── utils/            # Additional utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   ├── migrations/       # Database migrations
│   └── seeds/            # Seed scripts
├── public/               # Static assets
│   ├── medias/           # Uploaded media files
│   └── uploads/          # Additional uploads
├── scripts/              # Utility scripts
├── styles/               # SCSS stylesheets
├── test-results/         # Test results
├── tests/                # Test files
├── types/                # TypeScript type definitions
│   └── next-auth.d.ts    # NextAuth type extensions
├── components.json       # Shadcn UI configuration
├── eslint.config.mjs     # ESLint configuration
├── next-env.d.ts         # Next.js type definitions
├── next.config.ts        # Next.js configuration
├── package.json          # Package dependencies
├── playwright.config.ts  # Playwright configuration
├── postcss.config.mjs    # PostCSS configuration
├── prisma.config.ts      # Prisma configuration
├── proxy.ts              # Proxy configuration
├── README.md             # This file
├── TODO.md               # Project tasks
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment config
└── vitest.config.ts      # Vitest configuration
```

## Documentation

- [MADE (OS) Project Outline](.github/project-outline.md)
- [Development Mode Guide](docs/dev-mode.md)
- [Copilot Instructions](.github/copilot-instructions.md)

## Environment Variables

Required variables in `.env`:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AUTH_SECRET="your-auth-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (SMTP)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="465"
EMAIL_SECURE="true"
EMAIL_USER="your-email@example.com"
EMAIL_PASSWORD="your-email-password"
EMAIL_FROM="your-email@example.com"

# Development Mode
NEXT_PUBLIC_DEV_MODE="true"
```

## Features

- ✅ User authentication (Email/Password + Google OAuth)
- ✅ Role-based access control (RBAC)
- ✅ Forgot password with email reset
- ✅ Professional email templates
- ✅ Dark mode support
- ✅ Development tools and demo accounts
- 🚧 Order management workflow (coming soon)
- 🚧 Customer management (coming soon)
- 🚧 Inventory tracking (coming soon)

## License

ISC

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/MadeLabDev/madeapp/issues).
