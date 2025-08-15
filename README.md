# Gametrove 2025 - Game Collection Management Application

A modern, full-featured React application for managing and tracking your video game collection. Built with React 19.1, TypeScript, and Tailwind CSS following Clean Architecture principles.

## Features

### 🎮 **Core Functionality**
- **Game Collection Management** - View, search, and organize your games
- **Platform Integration** - Support for multiple gaming platforms with dynamic API-driven data
- **IGDB Integration** - Rich game metadata and search powered by IGDB API
- **Advanced Search** - Full-text search across game titles and metadata
- **Statistics Dashboard** - Collection insights and analytics
- **Console Tracking** - Dedicated platform/console management

### 🔍 **User Experience**
- **Responsive Design** - Optimized for desktop and mobile devices
- **Dark Theme** - Custom dark theme with slate color palette
- **Typeahead Components** - Fast, searchable dropdowns for better UX
- **Pagination** - Smooth navigation through large collections
- **View Modes** - List and grid views with localStorage memory
- **Loading States** - Comprehensive loading and error handling

### 🛠️ **Technical Features**
- **Authentication** - Secure Auth0 integration with JWT tokens
- **API Integration** - RESTful API communication with proper error handling
- **Caching** - Smart caching strategies for improved performance
- **Clean Architecture** - Well-organized codebase with clear separation of concerns

## Technology Stack

### **Frontend**
- **React 19.1** - Modern React with latest features
- **TypeScript** - Full type safety with strict configuration
- **Tailwind CSS 4.1** - Utility-first styling with custom dark theme
- **React Router DOM v7.7** - Client-side routing
- **Headless UI** - Accessible, unstyled UI components
- **Lucide React** - Modern icon library

### **Development Tools**
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting with TypeScript integration
- **Auth0** - Authentication and authorization platform

### **Architecture**
```
src/
├── application/     - Application layer (use cases, business logic)
├── domain/         - Domain layer (entities, business rules)  
├── infrastructure/ - Infrastructure layer (external services, APIs)
├── presentation/   - Presentation layer (UI components, pages, layouts)
└── shared/         - Shared utilities and types
```

## Project Structure

### **Domain Layer**
- **Models** - Core business entities (Game, Platform, User, Collection, etc.)
- **Interfaces** - Service contracts and abstractions
- **Validators** - Business rule validation

### **Infrastructure Layer**
- **API Services** - External service integrations (Game API, Platform API, IGDB, Stats)
- **Authentication** - Auth0 service implementation
- **Caching** - Data caching strategies

### **Presentation Layer**
- **Layouts** - Page layouts (DashboardLayout with sidebar/header)
- **Pages** - Route components (Dashboard, MyCollection, AddGame, Settings, etc.)
- **Components** - Reusable UI components organized by feature
- **Hooks** - Custom React hooks for data management
- **Contexts** - React context providers

## Key Components

### **Navigation & Layout**
- **DashboardLayout** - Main layout with responsive sidebar and header
- **Header** - Search functionality and user controls
- **Sidebar** - Navigation menu with active state management

### **Collection Management**
- **MyCollection** - Main collection view with search, filtering, and pagination
- **GamesTable** - Sortable, searchable game list
- **PaginationControls** - Navigation through large datasets
- **CollectionHeader** - Search and view mode controls

### **Game Management**
- **AddGame** - Multi-step game addition workflow with IGDB integration
- **GameDetail** - Comprehensive game information display
- **IGDB Search** - Real-time game search with metadata

### **Settings & Configuration**
- **Settings Page** - Tabbed interface for user preferences
- **Platform Mapping** - IGDB platform configuration with typeahead components
- **Profile Management** - User profile and API key management

### **Form Components**
- **PlatformCombobox** - Typeahead platform selection
- **IgdbPlatformCombobox** - IGDB platform mapping with search
- **Advanced Search** - Comprehensive search functionality

## Development Patterns

### **TypeScript Configuration**
- **Strict Mode** - Comprehensive type checking enabled
- **Const Assertions** - Preferred over enums for better tree-shaking
- **Type-Only Imports** - Explicit separation of types and values
- **Project References** - Multi-config setup for optimal compilation

### **Code Style Guidelines**
- **Clean Architecture** - Clear separation between layers
- **Component Organization** - Feature-based component structure
- **Custom Hooks** - Reusable data management logic
- **Error Boundaries** - Comprehensive error handling

### **UI/UX Patterns**
- **Design System** - Consistent styling with Tailwind utilities
- **Accessibility** - Screen reader support and keyboard navigation
- **Loading States** - Skeleton loaders and progress indicators
- **Empty States** - Helpful messaging for empty data

## Getting Started

### **Prerequisites**
- Node.js 18+
- npm

### **Environment Setup**
1. Copy `.env.example` to `.env`
2. Configure Auth0 settings:
   ```env
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_API_AUDIENCE=your-api-audience
   VITE_API_BASE_URL=https://localhost:7054
   ```

### **Development Commands**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Recent Major Updates

### **Platform Integration** (Latest)
- **IGDB Platform Service** - Full platform data integration with caching
- **Typeahead Components** - Replaced dropdowns with searchable components
- **Platform Mapping** - Advanced IGDB platform configuration system
- **Enhanced Settings** - Tabbed settings interface with platform management

### **Authentication & API Integration**
- **Auth0 Integration** - Secure authentication with JWT tokens
- **API Services** - Comprehensive API layer with error handling
- **Real Game Data** - Integration with live game database
- **Statistics Dashboard** - Collection analytics and insights

### **UI/UX Improvements**
- **Responsive Design** - Mobile-optimized layouts
- **Advanced Search** - Comprehensive search functionality
- **View Modes** - List/grid toggle with memory
- **Loading States** - Enhanced user feedback during data loading

## Architecture Highlights

### **Clean Architecture Implementation**
- **Domain-Driven Design** - Business logic separated from infrastructure
- **Dependency Inversion** - High-level modules don't depend on low-level modules
- **Interface Segregation** - Small, focused interfaces for better testability

### **Modern React Patterns**
- **Custom Hooks** - Encapsulated data management logic
- **Context Providers** - Global state management
- **Compound Components** - Flexible, reusable UI components
- **Error Boundaries** - Graceful error handling

### **Performance Optimizations**
- **Smart Caching** - API response caching with TTL
- **Lazy Loading** - Code splitting for optimal bundle sizes
- **Memoization** - Optimized re-renders with React.memo
- **Virtual Scrolling** - Efficient handling of large datasets

## Contributing

This project follows strict TypeScript configuration and Clean Architecture principles. Please ensure:

1. **Type Safety** - All code must be properly typed
2. **Layer Separation** - Respect architectural boundaries
3. **Component Organization** - Follow established patterns
4. **Testing** - Write tests for business logic
5. **Documentation** - Update documentation for major changes

## License

MIT License - see LICENSE file for details.