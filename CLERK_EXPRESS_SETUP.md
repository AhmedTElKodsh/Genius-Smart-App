# 🚀 Clerk Express.js Backend Setup

## 📚 **Following Clerk Documentation**
Reference: [Clerk Express.js Guide](https://clerk.com/docs/references/express/overview)

---

## 🔧 **Step 1: Get Your Secret Key**

### **From Clerk Dashboard:**
1. **Go to:** [Clerk Dashboard](https://dashboard.clerk.com) → **API Keys**
2. **Copy:** Your **Secret Key** (starts with `sk_test_`)
3. **Never** share this key publicly!

### **Add to Backend Environment:**
**File:** `server/.env`

```env
# Add this to your server/.env file
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Existing variables (keep these)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3004
PORT=5000
NODE_ENV=development
JWT_SECRET=genius-smart-secret-key-change-in-production
RESET_TOKEN_EXPIRY=3600
```

---

## 🔧 **Step 2: Verify Backend Integration**

### **Your Backend Already Has:**
✅ **Package installed:** `@clerk/express`
✅ **Middleware configured:** `clerkMiddleware()`
✅ **Protected routes:** `/api/clerk/*`
✅ **User management:** Role-based access

### **Test Backend Setup:**
```bash
# 1. Stop current backend (Ctrl+C)
# 2. Restart with new environment
cd server
npm start
```

### **Verify Clerk Integration:**
```bash
# Test health endpoint (should show clerkEnabled: true)
curl http://localhost:5000/api/health

# Expected response:
{
  "success": true,
  "message": "Genius Smart Backend API is running",
  "timestamp": "2025-07-22T...",
  "version": "1.0.0",
  "clerkEnabled": true  ← Should be true now!
}
```

---

## 🧪 **Step 3: Test Authentication Flow**

### **3.1 Test Sign-In Page:**
1. **Visit:** http://localhost:3004/sign-in
2. **Expected:** Professional Clerk sign-in form
3. **Features:** Email input, OTP verification

### **3.2 Test Email OTP:**
1. **Enter your email** in the sign-in form
2. **Click "Continue"**
3. **Check your email** for verification code
4. **Enter the OTP** to complete sign-in

### **3.3 Test Protected Backend Routes:**
```bash
# This should require authentication (will get 401 without token)
curl http://localhost:5000/api/clerk/user/profile

# Expected: 401 Unauthorized (this is correct!)
```

---

## 🔍 **Step 4: Backend Route Structure**

### **Public Routes (No Auth Required):**
- `GET /api/health` - Server status
- `POST /api/auth/*` - Legacy authentication
- `GET /api/teachers` - Legacy teacher endpoints
- `GET /api/manager/*` - Legacy manager endpoints

### **Clerk Protected Routes (Auth Required):**
- `GET /api/clerk/user/profile` - Current user info
- `POST /api/clerk/user/register` - User registration
- `GET /api/clerk/teachers/*` - Protected teacher endpoints
- `GET /api/clerk/manager/*` - Protected manager endpoints

---

## 🔐 **Step 5: User Role Management**

### **How It Works:**
1. **User signs in** with Clerk (Email OTP)
2. **Backend checks** existing teachers/managers by email
3. **Auto-assigns role** based on existing records
4. **New users** get "pending" status (admin approval)

### **Role Detection Logic:**
```javascript
// Existing teacher in database → Teacher role
// Existing manager in database → Manager role  
// New user → Pending approval
```

---

## 🎨 **Step 6: Frontend Integration Verification**

### **Clerk Components Working:**
- ✅ **ClerkProvider** wrapping app
- ✅ **SignIn component** themed to your design
- ✅ **SignUp component** with approval notice
- ✅ **Error handling** for missing keys

### **Route Structure:**
- `/sign-in` → Clerk authentication
- `/sign-up` → User registration  
- `/manager/signin` → Legacy authentication (still works)
- `/teacher/signin` → Legacy authentication (still works)

---

## 🧪 **Step 7: Complete Testing Flow**

### **Test Sequence:**
1. **Backend Setup:**
   ```bash
   cd server
   # Add CLERK_SECRET_KEY to .env
   npm start
   ```

2. **Verify Health:**
   ```bash
   curl http://localhost:5000/api/health
   # Should show: "clerkEnabled": true
   ```

3. **Test Sign-In:**
   - Visit: http://localhost:3004/sign-in
   - Enter your email
   - Complete OTP verification

4. **Test Role Detection:**
   - If your email matches existing teacher/manager → Auto role assignment
   - If new email → Pending approval status

---

## 🎯 **Expected Results**

### **✅ Success Indicators:**
- Clerk sign-in page loads properly
- Email OTP arrives quickly  
- Backend shows `clerkEnabled: true`
- Role detection works automatically
- Legacy authentication still functional

### **❌ Troubleshooting:**
- **No OTP email:** Check spam folder
- **Backend errors:** Verify `CLERK_SECRET_KEY` in `.env`
- **404 on routes:** Restart backend after adding secret key
- **Role issues:** Check email matches existing records

---

## 🎉 **Next: Test Your Setup!**

**Ready to test?** Follow the steps above and let me know what happens at each stage! 