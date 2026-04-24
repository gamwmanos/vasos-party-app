import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";

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

async function findKarak() {
  const snapshot = await getDocs(collection(db, "gallery"));
  for (const d of snapshot.docs) {
    const data = d.data();
    const name = (data.userName || "").toLowerCase();
    if (name.includes("karak") || name.includes("καρακ")) {
      console.log(`Found: docId=${d.id} | userId=${data.userId} | userName=${data.userName} | questId=${data.questId}`);
    }
  }
  process.exit(0);
}

findKarak().catch(console.error);
