# Environment Setup Instructions

## Setting Up Environment Variables

To run the application with full authentication features, you need to create a `.env` file in the `frontend/` directory.

### Step 1: Create the .env file

Copy the `env.example` file to `.env`:

```bash
cp env.example .env
```

### Step 2: Add your Clerk Publishable Key

Edit the `.env` file and add your Clerk publishable key:

```env
# Frontend Environment Variables
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_clerk_key_here
```

### Step 3: Get your Clerk Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Go to "API Keys" section  
4. Copy the "Publishable Key"
5. Paste it in your `.env` file

### Development Mode (Optional)

For development, you can run the app without Clerk authentication:
- The app will show warnings in the console but will still work
- Authentication features will be disabled
- This is useful for testing other features without setting up Clerk

### Production Deployment

For production, make sure to:
1. Set `VITE_CLERK_PUBLISHABLE_KEY` in your hosting environment
2. Set `VITE_BACKEND_URL` to your backend API URL
3. Never commit the `.env` file to version control

## Backend URL Configuration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses `VITE_BACKEND_URL` or relative `/api`

### Example Production .env:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_key
VITE_BACKEND_URL=https://your-api-domain.com
```