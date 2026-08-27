import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAYjYw-Qdn_CUwPW7UcwXlPNXtJZBbWYc4",
  authDomain: "gcek-erp-system.firebaseapp.com",
  projectId: "gcek-erp-system",
  storageBucket: "gcek-erp-system.firebasestorage.app",
  messagingSenderId: "608840566156",
  appId: "1:608840566156:web:fed543fa08ef194ce982a9",
  measurementId: "G-N6SYSZLSNT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);