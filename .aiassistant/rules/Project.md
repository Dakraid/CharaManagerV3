---
apply: always
---

# CharaManagerV3

## Project Overview

CharaManagerV3 is a Nuxt 4 application for managing TavernV2 character cards. It's a gallery-style web application that allows users to upload, parse, organize, and manage character cards used by SillyTavern, ChubAi, WyvernChat and similar applications.

## Key Technologies

- **Nuxt 4**: Vue.js framework with server-side rendering
- **TypeScript**: Primary language
- **Drizzle ORM**: Database ORM with PostgreSQL
- **shadcn-nuxt**: UI component library based on Tailwind CSS
- **Pinia**: State management
- **nuxt-auth-utils**: Authentication system

## Build/Lint/Test Commands

### Core Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate` - Generate static site

### Code Quality

- `npm run lint` - Run ESLint and Prettier checks
- `npm run lint:fix` - Auto-fix ESLint and Prettier issues
- `npm run eslint` - Run ESLint only
- `npm run prettier` - Check Prettier formatting

### Database

- `npx drizzle-kit migrate` - Run database migrations
- `npx drizzle-kit generate` - Generate new migration files

## Code Style Guidelines

- **Formatting**: Tabs (4 spaces), 160 char line width, trailing commas, single quotes
- **Imports**: Auto-sorted with prettier-plugin-sort-imports, separate groups with blank lines
- **TypeScript**: Explicit types preferred, `any` allowed, unused vars ignored in ESLint
- **Vue**: No default props required, multiple template roots allowed
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **API Routes**: Use `defineEventHandler`, always validate with `validateRequestQuery/Body`
- **Error Handling**: Use toast notifications, return structured responses with statusCode
- **Database**: Use Drizzle ORM, keep schema/migrations in `shared/utils/`
- **State**: Pinia stores with actions for API calls, getters for computed values
- **Components**: Feature-based organization, use shadcn-nuxt UI components when possible

## Architecture Overview

### Directory Structure

- `app/` - Main application code (Nuxt 4 app directory)
    - `components/` - Vue components organized by feature (Character, Common, ui)
    - `pages/` - Route pages
    - `layouts/` - Layout components
    - `stores/` - Pinia stores
    - `middleware/` - Route middleware
- `server/` - Server-side API and utilities
    - `api/` - API endpoints organized by feature
    - `utils/` - Server utilities (database, auth, image processing)
    - `tasks/` - Background tasks (image migration)
- `shared/` - Shared utilities and types
    - `utils/` - Common utilities and database schema/migrations
    - `types/` - TypeScript type definitions
- `images/` - Uploaded character images storage

### Key Architectural Patterns

**Component Organization**: Components are organized by feature (Character, Common) with a separate `ui/` folder containing reusable UI components from shadcn-nuxt.

**API Structure**: Server API endpoints are organized by resource (`/api/character`, `/api/characters`, `/api/auth`, etc.) using Nuxt's file-based routing.

**Database Layer**: Uses Drizzle ORM with PostgreSQL, requiring pgvector and pgcrypto extensions for embedding-based duplicate detection.

**Image Handling**: Automatic image processing pipeline that generates both full-size and thumbnail versions in AVIF format.

**State Management**: Pinia stores organized by feature (characterStore, uploadStore, settingsStore, appStore).

**Authentication**: Session-based authentication using nuxt-auth-utils with configurable registration.

### Development Notes

- Images are stored in the `images/` directory with numbered filenames (e.g., `1663.avif`, `1663_thumb.avif`)
- Database schema and migrations are in `shared/utils/`
- Character card parsing uses PNG metadata extraction for TavernV2 format
- Background tasks run via Nitro's scheduled tasks (hourly image migration)
- Development uses file-based routing for both pages and API endpoints
