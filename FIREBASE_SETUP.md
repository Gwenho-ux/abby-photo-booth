# 🔥 Firebase Storage Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "photo-booth-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Storage

1. In your Firebase project, go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (we'll configure security later)
4. Select a location for your storage bucket
5. Click "Done"

## Step 3: Get Firebase Configuration

1. Go to "Project Settings" (gear icon in sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</> icon)
4. Enter app nickname (e.g., "Photo Booth Web")
5. Click "Register app"
6. Copy the Firebase configuration object

## Step 4: Update Configuration

1. Open `modules/firebase-storage.js`
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 5: Configure Storage Security Rules

1. Go to "Storage" → "Rules" in Firebase Console
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to photos folder
    match /photos/{filename} {
      allow write: if true;
    }
  }
}
```

3. Click "Publish"

## Step 6: Test the Setup

1. Open your photo booth app at `http://localhost:8000`
2. Take a photo
3. Check the browser console for Firebase upload logs
4. If successful, you should see "✅ Firebase upload complete! URL: ..."

## Common Issues & Solutions

### ❌ "Firebase Storage unauthorized"
- Check your security rules in Firebase Console
- Make sure you published the rules
- Verify the rules allow read/write access

### ❌ "Firebase not configured"
- Make sure you replaced the placeholder config
- Check that all config values are correct
- Verify the project ID matches your Firebase project

### ❌ "Network error"
- Check your internet connection
- Verify Firebase project is active
- Try refreshing the page

### ❌ "Quota exceeded"
- Check your Firebase usage in the console
- Upgrade to paid plan if needed
- Clean up old files to free space

## Testing Firebase Upload

Visit `http://localhost:8000/test-firebase.html` to test Firebase functionality:
- Test configuration
- Test file upload
- Test integration with photo booth

## Expected Behavior

Once configured correctly:
1. Photos taken will upload to Firebase Storage
2. QR codes will contain Firebase Storage URLs
3. Users can access photos from any device
4. Photos are publicly accessible via the Firebase URLs

## Security Notes

The current setup allows public read access to all files and write access to the photos folder. For production use, consider:
- Adding authentication
- Limiting file sizes
- Adding rate limiting
- Implementing proper user permissions 