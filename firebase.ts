// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Extend Window interface for Firebase
declare global {
  interface Window {
    firebase: any;
  }
}

// Initialize Firebase
if (typeof window !== 'undefined' && typeof window.firebase !== 'undefined') {
  window.firebase.initializeApp(firebaseConfig);
}

export const auth = typeof window !== 'undefined' && window.firebase ? window.firebase.auth() : null;
export const db = typeof window !== 'undefined' && window.firebase ? window.firebase.firestore() : null;

// Helper functions
export const normPlate = (plate: string): string => {
  return plate.toString().trim().toUpperCase().replace(/\s+/g, "");
};

export const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export const waLink = (phone: string, text: string): string => {
  const p = (phone || "").replace(/[^\d]/g, "");
  const t = encodeURIComponent(text || "");
  return `https://wa.me/${p}?text=${t}`;
};
