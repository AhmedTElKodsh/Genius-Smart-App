# Clerk Production Setup

## Development Warning

The warning you're seeing:
```
Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.
```

This is **normal and expected** during development. It's not an error - it's Clerk informing you that you're using development keys.

## What This Means

- **In Development**: This warning is fine and can be ignored
- **In Production**: You must use production keys

## Setting Up Production Keys

When you're ready to deploy to production:

1. **Go to your Clerk Dashboard**
   - Visit https://dashboard.clerk.com
   - Select your application

2. **Switch to Production Instance**
   - In the dashboard, switch from "Development" to "Production"
   - Or create a new production instance

3. **Get Production Keys**
   - Copy your production publishable key
   - Copy your production secret key

4. **Update Environment Variables**

   In your `.env` file (for production):
   ```env
   # Clerk Production Keys
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
   CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY
   ```

5. **Update Webhook Endpoint (if using webhooks)**
   - Set your production webhook endpoint in Clerk dashboard
   - Update the webhook secret in your environment

## Important Notes

- **Never commit production keys** to version control
- Use environment variables for all sensitive keys
- The development warning will disappear automatically when using production keys
- Production instances have higher usage limits but may incur costs

## Verifying Production Setup

After deploying with production keys, you should:
1. No longer see the development warning
2. Have access to production features and limits
3. Be able to handle more users and API calls

## Current Status

Your application is correctly set up for development. This warning is not preventing any functionality and is simply informing you about the development environment status. 