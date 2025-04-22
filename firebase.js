
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAEdQWx8mPqO48ZzvtM_Gimt-Hdw68Kmq4",
  authDomain: "inventory-app-609ca.firebaseapp.com",
  projectId: "inventory-app-609ca",
  storageBucket: "inventory-app-609ca.firebasestorage.app",
  messagingSenderId: "921704322566",
  appId: "1:921704322566:web:4dab06516bd4bc3a18d587"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Save inventory to category (like "tees", "tanks", "transfers")
export async function saveInventory(category, data) {
  await setDoc(doc(db, "inventory", category), { data });
  console.log(`Saved ${category} inventory to Firebase`);
}

// Load inventory from category
export async function loadInventory(category) {
  const docSnap = await getDoc(doc(db, "inventory", category));
  if (docSnap.exists()) {
    return docSnap.data().data;
  } else {
    console.warn("No data found for", category);
    return {};
  }
}
