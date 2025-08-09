# CLAUDE UI/UX GUIDELINES

This document provides UI/UX guidelines for maintaining consistency across the Gametrove application based on the current dashboard implementation.

## Design System Foundation

### Color Palette
- **Primary Background**: `bg-slate-950` (#020617)
- **Secondary Background**: `bg-slate-900` (#0f172a)
- **Card Background**: `bg-slate-800` (#1e293b)
- **Border Color**: `border-slate-700` (#334155)
- **Accent Primary**: `bg-cyan-500` (#06b6d4)
- **Accent Hover**: `bg-cyan-600` (#0891b2)
- **Text Primary**: `text-white` (#ffffff)
- **Text Secondary**: `text-gray-400` (#9ca3af)
- **Text Muted**: `text-gray-300` (#d1d5db)

### Spacing System (8px Grid)
- **Base unit**: 4px (0.25rem)
- **Standard spacing**: 8px, 16px, 24px, 32px, 48px, 64px, 96px
- **Tailwind classes**: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-12` (48px), `p-16` (64px), `p-24` (96px)

## Layout Architecture

### Header Component
- **Position**: Fixed full-width (`fixed top-0 left-0 right-0`)
- **Height**: 4rem (64px) - `py-4` with content
- **Z-index**: `z-50` (highest layer)
- **Background**: `bg-slate-900`
- **Border**: `border-b border-slate-800`
- **Layout**: Three-section flex (`justify-between`)
  - Left: Logo + mobile menu button
  - Center: Search bar (centered with `flex-1` and `justify-center`)
  - Right: Action buttons

### Sidebar Navigation
- **Width**: 14rem (224px) - `w-56`
- **Height**: Full viewport minus header (`h-[calc(100vh-4rem)]` on desktop)
- **Position**: Static on desktop, fixed overlay on mobile
- **Z-index**: `z-30` (below header, above content)
- **Background**: `bg-slate-900`
- **Border**: `border-r border-slate-800`
- **Navigation spacing**: `mt-24` on desktop, `mt-16` on mobile

### Main Content Area
- **Padding**: `px-6` (24px horizontal), `pt-6` (24px top), `pb-8` (32px bottom)
- **Layout**: Full width container with proper sidebar offset
- **Background**: Inherits from body (`bg-slate-950`)

## Component Patterns

### Navigation Items
```tsx
// Standard navigation link structure
<NavLink 
  to={path}
  className={({isActive}) => 
    `flex items-center gap-3 pl-6 pr-4 py-3 transition-colors duration-200 
     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-inset
     ${isActive 
        ? 'bg-cyan-500 text-white' 
        : 'text-gray-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white'
     }`
  }
>
  <span aria-hidden="true">{icon}</span>
  {label}
</NavLink>
```

### Stats Cards
```tsx
// Dashboard stats card pattern
<div className="bg-slate-800 rounded-lg p-6 border border-slate-700 relative">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <div className="absolute top-4 right-4">
      {icon}
    </div>
  </div>
</div>
```

### Content Cards
```tsx
// Standard content card with header
<div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    <div className="flex items-center gap-4">
      {/* Actions/controls */}
    </div>
  </div>
  {/* Card content */}
</div>
```

## Interactive Elements

### Buttons

#### Primary Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white
                   rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 
                   focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
                   transition-colors duration-200">
  {icon}
  {text}
</button>
```

#### Secondary Button
```tsx
<button className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center
                   hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                   focus:ring-offset-2 focus:ring-offset-slate-900
                   transition-colors duration-200">
  {icon}
</button>
```

### Form Elements

#### Search Input
```tsx
<div className="relative w-full max-w-md">
  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg
               text-white placeholder-gray-400 focus:outline-none focus:ring-2 
               focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
    aria-label="Search description"
  />
</div>
```

#### Select Dropdown
```tsx
<select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 
                   text-white text-sm focus:outline-none focus:ring-2 
                   focus:ring-cyan-500 focus:border-cyan-500">
  <option>Option text</option>
</select>
```

## Accessibility Standards

### Focus States
- **All interactive elements** must have visible focus indicators
- **Focus ring**: `focus:outline-none focus:ring-2 focus:ring-cyan-500`
- **Focus offset**: `focus:ring-offset-2 focus:ring-offset-slate-900` for elements on dark backgrounds
- **Inset rings**: `focus:ring-inset` for navigation items

### ARIA Labels
- **Navigation**: `role="navigation" aria-label="Main navigation"`
- **Lists**: `role="list"` for navigation lists
- **Buttons**: Descriptive `aria-label` for icon-only buttons
- **Icons**: `aria-hidden="true"` for decorative icons
- **Current page**: `aria-current="page"` for active navigation items

### Semantic Structure
```tsx
// Navigation structure
<aside role="navigation" aria-label="Main navigation">
  <nav aria-label="Primary navigation">
    <ul role="list">
      <li>
        <NavLink aria-current="page">
          <span aria-hidden="true">{icon}</span>
          {label}
        </NavLink>
      </li>
    </ul>
  </nav>
</aside>
```

## Typography Scale

### Headers
- **Page Title**: `text-3xl font-bold text-white mb-2` (48px)
- **Section Title**: `text-xl font-semibold text-white` (20px)
- **Card Title**: `text-lg font-bold text-white` (18px)

### Body Text
- **Primary**: `text-white` (16px default)
- **Secondary**: `text-gray-400` (16px muted)
- **Small**: `text-sm text-gray-400` (14px)
- **Extra Small**: `text-xs` (12px)

### Navigation
- **Nav Items**: `text-gray-300` default, `text-white` active/hover
- **Brand**: `text-lg font-bold text-white`

## Grid Systems

### Stats Cards Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 1 column mobile, 2 tablet, 4 desktop */}
</div>
```

### Content Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Standard content grid with smaller gaps */}
</div>
```

## Z-Index Scale
- **Header**: `z-50` (Global navigation)
- **Sidebar**: `z-30` (Page navigation) 
- **Overlays**: `z-20` (Mobile backdrop)
- **Content**: `z-auto` (Default)

## Animation & Transitions
- **Standard duration**: `duration-200` (200ms)
- **Sidebar transform**: `duration-300` (300ms)
- **Standard easing**: Default Tailwind easing
- **Properties**: `transition-colors`, `transition-transform`

## Responsive Breakpoints
- **Mobile**: Default styles (< 768px)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large Desktop**: `xl:` prefix (1280px+)

## Icon Guidelines
- **Navigation icons**: 20px (`size={20}`)
- **Header icons**: 20-24px (`size={20}` or `size={24}`)
- **Button icons**: 20px (`size={20}`)
- **Always use**: `aria-hidden="true"` for decorative icons
- **Icon library**: Lucide React

## Implementation Checklist

When creating new pages/components:

### ✅ Layout
- [ ] Use consistent padding (`px-6`, `pt-6`, `pb-8`)
- [ ] Follow 8px grid spacing system
- [ ] Implement proper responsive breakpoints

### ✅ Components  
- [ ] Use established card patterns
- [ ] Apply consistent color scheme
- [ ] Follow button and form element patterns

### ✅ Accessibility
- [ ] Add focus states to all interactive elements
- [ ] Include proper ARIA labels
- [ ] Use semantic HTML structure
- [ ] Test keyboard navigation

### ✅ Visual Design
- [ ] Maintain consistent typography scale
- [ ] Use proper z-index layering
- [ ] Apply smooth transitions
- [ ] Follow icon sizing guidelines

## Example Page Structure
```tsx
// Standard page layout pattern
export const NewPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-white mb-2">Page Title</h1>
      <p className="text-gray-400 mb-8">Page description</p>

      {/* Stats/Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats cards */}
      </div>

      {/* Main Content */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Section Title</h2>
          {/* Section controls */}
        </div>
        {/* Section content */}
      </div>
    </div>
  );
};
```

---

*This document should be updated whenever new UI patterns are established or existing patterns are modified.*