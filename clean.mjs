import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";

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

async function clean() {
  const q = query(collection(db, "gallery"), where("userId", "==", "manos2-1234"));
  const querySnapshot = await getDocs(q);
  
  for (const document of querySnapshot.docs) {
    console.log("Deleting gallery item:", document.id);
    await deleteDoc(doc(db, "gallery", document.id));
  }
  
  // also delete from completedQuests subcollection if any
  const completedSnapshot = await getDocs(collection(db, "users", "manos2-1234", "completedQuests"));
  for (const document of completedSnapshot.docs) {
    console.log("Deleting user completed quest:", document.id);
    await deleteDoc(doc(db, "users", "manos2-1234", "completedQuests", document.id));
  }
  
  console.log("Deleting user doc");
  await deleteDoc(doc(db, "users", "manos2-1234"));

  console.log("Done");
  process.exit(0);
}

clean().catch(console.error);
