# Genius Smart App - Attendance Management System

<div align="center">
  <img src="docs/design/logo.png" alt="Genius Smart App Logo" width="200"/>
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📌 Overview

**Genius Smart App** is a comprehensive web-based attendance management system designed for educational institutions. It provides secure authentication, real-time attendance tracking, and powerful analytics for both managers and teachers.

### 🎯 Key Features

- **🔐 Dual Portal System**: Separate interfaces for managers and teachers
- **🌍 Multi-language Support**: Full Arabic/English support with RTL layout
- **📍 Location-based Attendance**: GPS verification for check-in/check-out
- **📊 Advanced Analytics**: Real-time dashboards and detailed reports
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **🔑 Secure Authentication**: Clerk integration with role-based access
- **📧 Email Notifications**: Automated alerts for requests and approvals
- **🗓️ Holiday Management**: Dynamic weekend and holiday configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git
- Clerk account (for authentication)
- SMTP server (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/genius-smart-app.git
   cd genius-smart-app
   ```

2. **Run the reorganization script** (if project structure needs organizing)
   ```bash
   chmod +x reorganize-project.sh
   ./reorganize-project.sh
   ```

3. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

4. **Configure environment variables**
   
   Create `.env` files in both client and server directories:
   
   **client/.env**
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_your_clerk_key
   VITE_API_URL=http://localhost:5000
   ```
   
   **server/.env**
   ```env
   PORT=5000
   CLERK_SECRET_KEY=sk_your_clerk_secret
   CLERK_PUBLISHABLE_KEY=pk_your_clerk_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
Genius-Smart-App/
├── 📁 client/                    # Frontend React application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 utils/           # Utility functions
│   │   ├── 📁 styles/          # Global styles and themes
│   │   └── 📁 types/           # TypeScript definitions
│   └── package.json
├── 📁 server/                    # Backend Express application
│   ├── 📁 config/               # Server configuration
│   ├── 📁 middleware/           # Express middleware
│   ├── 📁 routes/              # API routes
│   ├── 📁 utils/               # Server utilities
│   ├── 📁 scripts/             # Database scripts
│   ├── 📁 data/                # JSON database files
│   └── package.json
├── 📁 docs/                      # Project documentation
│   ├── 📁 api/                  # API documentation
│   ├── 📁 database/             # Database schemas
│   ├── 📁 guides/               # User guides
│   └── 📁 development/          # Development logs
└── 📁 resources/                 # Additional resources
    └── 📁 datasets/             # Sample data files
```

## 🛠️ Technology Stack

### Frontend
- **React** 18.2.0 - UI library
- **TypeScript** 4.9.5 - Type safety
- **Vite** 4.1.0 - Build tool
- **React Router** 6.8.0 - Routing
- **Styled Components** 5.3.6 - Styling
- **Chart.js** 4.5.0 - Data visualization
- **Clerk** - Authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **JSON Files** - Data storage
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Joi** - Data validation

## 📚 Documentation

### For Developers
- [Project Architecture](docs/PROJECT_ARCHITECTURE.md) - System design and structure
- [API Documentation](docs/api/BACKEND_API_DOCUMENTATION.md) - Complete API reference
- [Database Documentation](docs/database/DATABASE_DOCUMENTATION.md) - Schema and operations

### For Users
- [Setup Guide](docs/guides/SETUP_GUIDE.md) - Detailed installation instructions
- [User Manual](docs/guides/USER_MANUAL.md) - How to use the application
- [Admin Guide](docs/guides/ADMIN_GUIDE.md) - Administration tasks

### Quick Links
- [Login Credentials](docs/credentials/QUICK_LOGIN_REFERENCE.md)
- [Troubleshooting](docs/guides/TROUBLESHOOTING.md)
- [FAQ](docs/guides/FAQ.md)

## 🔑 Default Login Credentials

### Admin Access
- **Email**: admin@genius-smart.com
- **Password**: Admin@123

### Manager Access
- **Email**: manager@genius-smart.com
- **Password**: Manager@123

### Teacher Access
- **Email**: teacher@genius-smart.com
- **Password**: Teacher@123

⚠️ **Important**: Change these passwords immediately after first login!

## 🏗️ Development

### Available Scripts

#### Root Level
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build frontend for production
npm run install:all  # Install all dependencies
```

#### Frontend (in client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

#### Backend (in server/)
```bash
npm run start        # Start production server
npm run dev          # Start development server
npm run test         # Run tests
```

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push changes: `git push origin feature/your-feature`
4. Create pull request for review

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Configure production environment**
   - Set production environment variables
   - Enable HTTPS
   - Configure domain and SSL certificates

3. **Deploy using PM2** (recommended)
   ```bash
   npm install -g pm2
   cd server
   pm2 start server.js --name genius-smart-api
   ```

### Docker Deployment

```bash
docker-compose up -d
```

See [Deployment Guide](docs/guides/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- **Authentication**: Clerk provides secure, scalable authentication
- **Password Security**: Bcrypt hashing with salt rounds
- **API Security**: CORS, Helmet, and rate limiting
- **Data Validation**: Joi schemas for all inputs
- **HTTPS**: Required for production deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Educational institutions for requirements and feedback
- Open source community for amazing tools
- Contributors and testers

## 📞 Support

- **Email**: support@genius-smart.com
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/genius-smart-app/issues)

---

<div align="center">
  Made with ❤️ by Genius Smart Team
</div> 