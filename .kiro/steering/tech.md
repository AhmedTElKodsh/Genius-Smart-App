# Technology Stack

## Frontend Framework
- **React 18** with TypeScript for type-safe development
- **Vite** as build tool and development server
- **React Router DOM v6** for client-side routing

## Styling & UI
- **Styled Components** for CSS-in-JS styling approach
- **Responsive Design** with mobile-first approach
- **Custom Design System** with defined color palette and typography

## Form Handling
- **React Hook Form** for form management and validation
- Client-side validation with real-time feedback
- Input sanitization and error handling

## Development Tools
- **TypeScript** for static type checking
- **Vitest** for testing framework
- **ESLint** with React app configuration
- **Path aliases** configured via Vite (@/ for src/)

## Build System

### Common Commands
```bash
# Development
npm run dev          # Start development server on port 3000

# Building
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build locally

# Testing
npm test             # Run tests with Vitest
npm run test:ui      # Interactive test UI

# Package Management
npm install          # Install dependencies
```

## Project Configuration
- **Port**: Development server runs on port 3000
- **Build Output**: `build/` directory
- **Source Maps**: Enabled for production builds
- **Auto-open**: Browser opens automatically in development

## Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile and tablet browsers with responsive design
- Graceful degradation for older browsers