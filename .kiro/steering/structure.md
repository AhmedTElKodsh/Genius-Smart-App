# Project Structure

## Root Directory Organization
```
├── src/                    # Source code
├── public/                 # Static assets (logos, images)
├── build/                  # Production build output
├── node_modules/           # Dependencies
├── .kiro/                  # Kiro AI assistant configuration
├── .cursor/                # Cursor IDE configuration
├── .taskmaster/            # Task management system
├── Managers-pics/          # Design reference images
└── package.json            # Project configuration
```

## Source Code Structure (`src/`)
```
src/
├── components/             # Reusable UI components
│   └── ResponsiveLayout.tsx
├── pages/                  # Page-level components
│   ├── RoleSelection.tsx   # Landing page for role selection
│   ├── ManagerSignin.tsx   # Manager authentication
│   └── ResetPassword.tsx   # Password recovery flow
├── hooks/                  # Custom React hooks (empty, ready for use)
├── utils/                  # Utility functions (empty, ready for use)
├── types/                  # TypeScript type definitions (empty, ready for use)
├── App.tsx                 # Main application component with routing
├── index.tsx               # Application entry point
└── index.css               # Global styles
```

## Path Aliases Configuration
- `@/` → `src/`
- `@/components` → `src/components`
- `@/pages` → `src/pages`
- `@/hooks` → `src/hooks`
- `@/utils` → `src/utils`
- `@/types` → `src/types`

## Routing Structure
- `/` → Role Selection (landing page)
- `/manager/signin` → Manager authentication
- `/manager/reset-password` → Password recovery
- `*` → Redirect to home (catch-all)

## Asset Organization
- `public/` contains static assets (logos, school branding)
- `Managers-pics/` contains design reference images and mockups
- Images follow descriptive naming convention

## Development Folders
- `hooks/`, `utils/`, `types/` are prepared but empty, ready for future development
- Components are organized by reusability (components/) vs page-specific (pages/)
- Single-responsibility principle applied to component organization

## Naming Conventions
- **Components**: PascalCase (e.g., `ResponsiveLayout.tsx`)
- **Pages**: PascalCase with descriptive names (e.g., `ManagerSignin.tsx`)
- **Files**: camelCase for utilities, PascalCase for React components
- **Folders**: lowercase with hyphens for multi-word names