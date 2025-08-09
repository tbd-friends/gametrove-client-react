# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

### Build Process
The build process runs TypeScript compilation first (`tsc -b`) then Vite build. Both must succeed for a successful build.

## Project Architecture

### Technology Stack
- **Frontend**: React 19.1 with TypeScript
- **Routing**: React Router DOM v7.7
- **Styling**: Tailwind CSS v4.1 with custom dark theme
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

### Architecture Pattern
This project follows a **Clean Architecture** pattern with clear separation of concerns:

```
src/
├── application/     - Application layer (use cases, business logic)
├── domain/         - Domain layer (entities, business rules)  
├── infrastructure/ - Infrastructure layer (external services, APIs)
├── presentation/   - Presentation layer (UI components, pages, layouts)
└── shared/         - Shared utilities and types
```

### Presentation Layer Structure
- **layouts/**: Page layouts (e.g., DashboardLayout with sidebar/header)
- **pages/**: Route components exported from index.ts
- **components/**: Reusable UI components organized by feature
- **styles/**: Shared styling constants and utilities

### Routing Architecture
The app uses nested routing with a main `DashboardLayout` that wraps all pages. Currently implements custom navigation state management in the layout component rather than using React Router's built-in navigation.

### Styling System
- Uses Tailwind CSS with a dark theme (slate color palette)
- Custom slate-950 color defined for darker backgrounds
- Shared style constants in `presentation/styles/constants.ts`
- Consistent design system with cyan accent color (#22d3ee)

### Current Application State
This is a **Game Collection Management** application called "Gametrove" that allows users to track their video game library. The app is in early development with:
- Basic dashboard layout with sidebar navigation
- Placeholder pages for Dashboard, My Collection, Console Tracker, Add Game, and Settings
- Header with search functionality and user controls
- Mobile-responsive sidebar with overlay

### Key Components
- **DashboardLayout**: Main layout wrapper with sidebar and header
- **Header**: Top navigation with search and user controls  
- **Sidebar**: Navigation menu with game collection related links
- **Pages**: Placeholder components for different app sections

### Development Notes
- TypeScript configuration uses project references (tsconfig.json, tsconfig.app.json, tsconfig.node.json)
- ESLint configured for React and TypeScript
- No test framework currently configured
- Application, domain, and infrastructure layers are currently empty (architecture prepared for future development)

## Development Workflow Reminders
- Should not try to `npm run`, I will run the app, just indicate to me that now might be a good time to run

## Branch Naming Conventions
- When creating a branch, always use a prefix to indicate the purpose:
  - `feature/` for new features or substantial improvements
  - `chore/` for maintenance, cleanup, or non-feature work
  - Branch names should be brief and descriptive, using hyphens to separate words
  - Example: `chore/cleanup-code-styles` or `feature/add-game-search-functionality`

## Merge Guidelines
- When I do a branch merge, it should squash