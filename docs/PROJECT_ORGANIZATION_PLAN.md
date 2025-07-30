# Genius Smart App - Project Organization Plan

## Current Issues
- Root directory cluttered with numerous documentation files
- No clear separation between development docs and project documentation
- Missing centralized documentation
- Backend and frontend configurations mixed in root

## Proposed New Structure

```
Genius-Smart-App/
├── 📁 client/                    # Frontend application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 hooks/           # Custom hooks
│   │   ├── 📁 utils/           # Utility functions
│   │   ├── 📁 styles/          # Global styles
│   │   ├── 📁 types/           # TypeScript types
│   │   └── 📁 config/          # Frontend configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── 📁 server/                    # Backend application
│   ├── 📁 config/               # Server configuration
│   ├── 📁 middleware/           # Express middleware
│   ├── 📁 models/              # Data models
│   ├── 📁 routes/              # API routes
│   ├── 📁 utils/               # Server utilities
│   ├── 📁 scripts/             # Database scripts
│   ├── 📁 data/                # JSON database files
│   │   └── 📁 backups/         # Database backups
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── 📁 docs/                      # All documentation
│   ├── 📁 development/          # Development logs/notes
│   ├── 📁 api/                  # API documentation
│   ├── 📁 database/             # Database schema docs
│   ├── 📁 guides/               # Setup and usage guides
│   ├── 📁 credentials/          # Login credentials docs
│   └── 📁 design/               # UI/UX design files
│       └── 📁 mockups/          # UI mockups and screenshots
│
├── 📁 resources/                 # Project resources
│   └── 📁 datasets/             # CSV and JSON datasets
│
├── README.md                     # Main project documentation
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # License file
├── .gitignore                  # Git ignore rules
├── .env.example                # Environment variables template
└── package.json                # Root package.json for workspace
```

## Migration Steps

### Phase 1: Create New Directory Structure
1. Create `client/` directory and move all frontend files
2. Keep `server/` directory as is (already well-organized)
3. Create comprehensive `docs/` structure
4. Create `resources/` for datasets

### Phase 2: Move Files
- Move all `.md` files from root to appropriate `docs/` subdirectories
- Move `Managers-pics/` to `docs/design/mockups/`
- Move CSV files to `resources/datasets/`
- Move frontend files to `client/`

### Phase 3: Update Configurations
- Update import paths in code
- Update build scripts
- Create workspace configuration
- Update documentation references

### Phase 4: Create Core Documentation
- Comprehensive README.md
- API documentation
- Database schema documentation
- Setup and deployment guides 