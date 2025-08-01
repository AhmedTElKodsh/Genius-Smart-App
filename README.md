# Genius Smart Attendance Management System

A comprehensive attendance management system for educational institutions with separate frontend and backend deployments.

## Project Structure

```
Genius-Smart-App/
├── frontend/                 # React.js frontend application
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── backend/                 # Node.js/Express backend
│   ├── server/              # Server code
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   ├── data/            # JSON data files
│   │   └── server.js        # Main server file
│   ├── resources/           # Shared resources
│   └── package.json         # Backend dependencies
└── README.md               # This file
```

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend Development
```bash
cd backend
npm install
npm run dev
```
The backend will be available at `http://localhost:5000`

## Environment Configuration

### Frontend Environment Variables
Create a `.env.local` file in the frontend directory:
```bash
# For production deployment, set your backend URL
VITE_BACKEND_URL=https://your-backend-domain.com

# Clerk Authentication (if using)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Backend Environment Variables
Create a `.env` file in the backend directory:
```bash
PORT=5000
NODE_ENV=production

# Email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# JWT Secret
JWT_SECRET=your-jwt-secret

# Clerk (if using)
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Production Deployment

### Option 1: Same Domain Deployment
If deploying both frontend and backend on the same domain:

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy Backend with Static Files:**
   ```bash
   cd backend
   npm install --production
   ```

3. **Configure Backend to Serve Frontend:**
   Add to your `backend/server/server.js`:
   ```javascript
   // Serve static files from frontend build
   app.use(express.static(path.join(__dirname, '../../frontend/build')));
   
   // Handle React routing
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
   });
   ```

### Option 2: Separate Domain Deployment
For deploying frontend and backend on different domains:

1. **Deploy Frontend:**
   ```bash
   cd frontend
   # Set VITE_BACKEND_URL in your environment
   export VITE_BACKEND_URL=https://your-backend-api.com
   npm run build
   # Deploy the 'build' folder to your static hosting service
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Configure CORS:**
   Update `backend/server/server.js` CORS settings:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-domain.com'],
     credentials: true
   }));
   ```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run test` - Run tests

## Features

### Manager Portal
- Teacher management (add, edit, delete)
- Attendance analytics and reporting
- Request management and approval
- Real-time dashboard with insights
- Multi-language support (English/Arabic)

### Teacher Portal
- Attendance tracking with geolocation
- Request submission (absence, late arrival, early leave)
- Personal dashboard and history
- Notification system
- Mobile-responsive design

### Technical Features
- **Authentication:** Multi-role authentication system
- **Real-time:** Live updates for requests and notifications
- **Responsive:** Mobile-first design for teachers
- **Multilingual:** RTL support for Arabic interface
- **Analytics:** Comprehensive reporting and insights
- **Security:** Role-based access control and data validation

## API Documentation

The backend provides RESTful APIs for:
- Authentication (`/api/auth`)
- Teacher management (`/api/teachers`)
- Attendance tracking (`/api/attendance`)
- Request management (`/api/requests`)
- Analytics and reporting (`/api/analytics`)
- System settings (`/api/settings`)

## Database

The application uses JSON files for data storage:
- `teachers.json` - Teacher profiles and credentials
- `requests.json` - Absence and request records
- `attendance.json` - Daily attendance records
- `subjects.json` - Department/subject information
- `holidays.json` - Holiday calendar

## Security Considerations

- All API endpoints require authentication
- Role-based access control for different user types
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Secure password handling with bcrypt

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Genius Smart Educational Institution.

## Support

For technical support or questions, contact the development team.