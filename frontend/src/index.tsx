import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

// Get Clerk publishable key from environment variables (following official docs)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// For development: allow running without Clerk key (show warning instead of error)
if (!PUBLISHABLE_KEY) {
  console.warn("⚠️ Missing Clerk Publishable Key - Authentication features will be disabled");
  console.warn("💡 To enable authentication, add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

const container = document.getElementById('root')!;
const root = createRoot(container);

// Render with or without Clerk based on key availability
const AppContent = (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
);

root.render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        {AppContent}
      </ClerkProvider>
    ) : (
      AppContent
    )}
  </React.StrictMode>
); 
