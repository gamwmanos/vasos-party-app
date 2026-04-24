import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHeUC0q7gJCWaXutEXYmz6lF5o5-NTVx0",
  authDomain: "based-party.firebaseapp.com",
  projectId: "based-party",
  storageBucket: "based-party.firebasestorage.app",
  messagingSenderId: "65649814018",
  appId: "1:65649814018:web:081d4135720f49842c951b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeKarakQ11() {
  // Remove from gallery
  await deleteDoc(doc(db, "gallery", "mc-karak-1111_q11"));
  console.log("Deleted gallery/mc-karak-1111_q11");

  // Remove from completedQuests so points disappear
  await deleteDoc(doc(db, "users", "mc-karak-1111", "completedQuests", "q11"));
  console.log("Deleted users/mc-karak-1111/completedQuests/q11");

  console.log("Done! Karak lost the piggyback points.");
  process.exit(0);
}

removeKarakQ11().catch(console.error);
