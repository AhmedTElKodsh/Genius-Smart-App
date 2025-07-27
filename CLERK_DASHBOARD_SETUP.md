# 🔐 Clerk Dashboard Configuration Guide

## 📋 **Essential Dashboard Settings**

### **1. Authentication Configuration**

#### **📧 Email Settings**
**Path:** Dashboard → **User & Authentication** → **Email, Phone, Username**

**Required Settings:**
- ✅ **Email address**: Required
- ✅ **Email verification code**: Enable (this is your OTP)
- ❌ **Password**: Disable for pure OTP authentication
- ❌ **Phone number**: Optional
- ❌ **Username**: Optional

**Result:** Users sign in with email + OTP only

#### **🔐 Sign-up & Sign-in Flow**
**Path:** Dashboard → **User & Authentication** → **Sign-up and sign-in**

**Recommended Settings:**
- ✅ **Progressive sign-up**: Better user experience
- ✅ **Email verification required**: Security
- ⚙️ **Restrict sign-ups**: Choose based on your needs
  - **Open**: Anyone can sign up
  - **Restricted**: Only invited users
  - **Closed**: No new sign-ups

#### **🎨 Appearance Customization**
**Path:** Dashboard → **Customization** → **Appearance**

**Customize to match your app:**
- **Primary color**: `#D4AF37` (your golden theme)
- **Upload logo**: Your school logo
- **Font**: Match your app's typography

### **2. Get Your API Keys**

#### **📋 API Keys Location**
**Path:** Dashboard → **API Keys**

**Copy these keys:**
```
✅ Publishable Key: pk_test_YXB0LWhlcm1pdC01OC5jbGVyay5hY2NvdW50cy5kZXYk ✅ DONE
🔧 Secret Key: sk_test_... (Get this now!)
```

#### **🔒 Security Best Practices**
- **Never** expose Secret Key in frontend
- **Store** in environment variables only
- **Rotate** keys if compromised

### **3. Domain & Redirect Settings**

#### **🌐 Allowed Origins**
**Path:** Dashboard → **Domains**

**Add your development domains:**
```
http://localhost:3004 (your current frontend)
http://localhost:3000
http://localhost:5000 (your backend)
```

#### **↩️ Redirect URLs**
**Path:** Dashboard → **Paths**

**Configure redirect paths:**
- **After sign-in**: `/dashboard` (for managers) or `/teacher/home`
- **After sign-up**: `/welcome` or role-based redirect
- **After sign-out**: `/`

### **4. Email Templates** (Optional)

#### **📧 Customize Email OTP**
**Path:** Dashboard → **Customization** → **Emails**

**Customize the verification email:**
- Add your school branding
- Include helpful instructions
- Match your app's language tone

### **5. Webhooks** (Advanced - Optional)

#### **🔔 User Event Webhooks**
**Path:** Dashboard → **Webhooks**

**For advanced user sync:**
- **user.created**: Sync new users to your database
- **user.updated**: Update user information
- **session.created**: Track user activity

**Webhook URL example:**
```
https://your-backend.com/api/clerk/webhooks
```

---

## ✅ **Quick Verification Checklist**

After configuration, verify these settings:

- [ ] Email verification code enabled
- [ ] Password authentication disabled (if OTP-only)
- [ ] Publishable key in frontend `.env.local`
- [ ] Secret key ready for backend
- [ ] Appearance matches your branding
- [ ] Redirect URLs configured
- [ ] Domain restrictions set (if needed)

---

## 🎯 **Next Step: Backend Setup**

Once dashboard is configured, proceed to backend setup with your Secret Key! 