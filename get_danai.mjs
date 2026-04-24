import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

async function findDanai() {
  const querySnapshot = await getDocs(collection(db, "gallery"));
  
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (data.userName.toLowerCase().includes("δανα") || data.userName.toLowerCase().includes("δανά")) {
      console.log(`Found: ID=${document.id}, userName=${data.userName}, userId=${data.userId}, questId=${data.questId}`);
    }
  }
  console.log("Done");
  process.exit(0);
}

findDanai().catch(console.error);
