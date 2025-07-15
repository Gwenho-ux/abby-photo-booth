import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// 💋 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVnoUh8nZwBEke00S9SxPk7ftFvILIQfQ",
  authDomain: "photo-booth-db46a.firebaseapp.com",
  projectId: "photo-booth-db46a",
  storageBucket: "photo-booth-db46a.firebasestorage.app",
  messagingSenderId: "859956436910",
  appId: "1:859956436910:web:fa14bdc3e1f60464d4723f",
  measurementId: "G-3NR08DDE71"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 🔥 Function to upload image blob and get public URL
export async function uploadImageToFirebase(blob, filename) {
  try {
    console.log("🔄 Starting Firebase upload for:", filename);
    
    // Create reference to file in Firebase Storage
    const storageRef = ref(storage, 'photos/' + filename);
    
    // Upload the file
    console.log("📤 Uploading file to Firebase...");
    const snapshot = await uploadBytes(storageRef, blob);
    console.log("📁 File uploaded successfully, getting download URL...");
    
    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);
    console.log("✅ Firebase upload complete! URL:", url);
    
    return url;
  } catch (error) {
    console.error("❌ Firebase upload failed:", error);
    console.error("Error details:", error.message);
    
    // Check for common Firebase errors
    if (error.code === 'storage/unauthorized') {
      console.error("🔒 Firebase Storage unauthorized - check your security rules");
    } else if (error.code === 'storage/invalid-argument') {
      console.error("📝 Invalid file or filename");
    } else if (error.code === 'storage/quota-exceeded') {
      console.error("💾 Firebase Storage quota exceeded");
    }
    
    throw error;
  }
}

// Initialize Firebase (called automatically when module is imported)
console.log("🔥 Firebase Storage initialized");

// Make functions available globally for non-module scripts
window.uploadImageToFirebase = uploadImageToFirebase;

// Example usage function (for testing)
export async function testFirebaseUpload() {
  const testBlob = new Blob(["test"], { type: "text/plain" });
  return await uploadImageToFirebase(testBlob, "test-" + Date.now() + ".txt");
} 