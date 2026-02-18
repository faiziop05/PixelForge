# PixelForge Setup Guide

This guide will help you set up all the necessary services and configurations to run PixelForge.

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Pexels API Setup](#pexels-api-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the App](#running-the-app)

---

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `PixelForge` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Register Your App

1. In the Firebase console, click the web icon (`</>`)
2. Register app with nickname: `PixelForge Web`
3. Copy the Firebase configuration object

### Step 3: Enable Authentication

1. In Firebase console, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. (Optional) Enable **Google** sign-in method:
   - Click on Google provider
   - Enable it
   - Add your support email
   - Save

### Step 4: Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select your preferred region
5. Click "Enable"

**Security Rules (Development):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 5: Enable Storage

1. Go to **Build** → **Storage**
2. Click "Get started"
3. Choose **Start in test mode**
4. Select your region
5. Click "Done"

**Security Rules (Development):**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 6: Get Your Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Copy the `firebaseConfig` object
4. Update `firebase.config.js` in your project with these values

---

## Pexels API Setup

### Step 1: Create Account

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Click "Get Started"
3. Sign up for a free account

### Step 2: Generate API Key

1. After signing up, you'll receive an API key
2. Copy your API key
3. Save it for the next step

**API Limits (Free Tier):**

- 200 requests per hour
- 20,000 requests per month

---

## Environment Configuration

### Step 1: Create .env File

1. In the project root, copy `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your credentials:

```env
# Pexels API
PEXELS_API_KEY=your_pexels_api_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### Step 2: Update firebase.config.js

Open `firebase.config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## Running the App

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm start
```

This will start the Expo development server.

### Step 3: Run on Device/Emulator

**iOS (Mac only):**

```bash
npm run ios
```

**Android:**

```bash
npm run android
```

**Physical Device:**

1. Install Expo Go from App Store or Play Store
2. Scan the QR code from the terminal

---

## Testing Authentication

1. **Create Test Account:**

   - Open the app
   - Navigate to Sign Up
   - Create account with test email

2. **Test Guest Mode:**

   - On login screen, tap "Continue as Guest"
   - Explore features in guest mode

3. **Verify Firestore:**
   - After signup, check Firebase Console
   - Go to Firestore Database
   - You should see a new user document

---

## Troubleshooting

### Firebase Connection Issues

**Problem:** "Firebase configuration error"

- **Solution:** Double-check all values in `firebase.config.js`
- Ensure Firebase project is created and services are enabled

### Pexels API Issues

**Problem:** "Failed to fetch wallpapers"

- **Solution:** Verify your Pexels API key
- Check you haven't exceeded rate limits (200/hour)

### Build Errors

**Problem:** Metro bundler errors

- **Solution:** Clear cache and rebuild
  ```bash
  npm start -- --clear
  ```

### Permission Issues (Android)

**Problem:** Cannot access camera/storage

- **Solution:** Check `app.json` permissions are configured
- Grant permissions manually in device settings

---

## Production Deployment

### Update Firebase Security Rules

**Firestore:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /projects/{userId}/userProjects/{projectId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /favorites/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

**Storage:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Build for Production

**Android:**

```bash
eas build --platform android
```

**iOS:**

```bash
eas build --platform ios
```

---

## Next Steps

- ✅ Test all authentication flows
- ✅ Create test wallpaper projects
- ✅ Verify favorites sync across devices
- ✅ Test image download and storage
- ✅ Customize app branding and colors

**Need Help?** Open an issue on GitHub or contact support.
