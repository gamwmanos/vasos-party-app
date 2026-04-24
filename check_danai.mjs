import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
  const querySnapshot = await getDocs(collection(db, "gallery"));
  
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    if (data.userName.toLowerCase().includes("δανα") || data.userName.toLowerCase().includes("δανά")) {
      console.log(`Gallery ID: ${doc.id} | userId: ${data.userId} | questId: ${data.questId} | userName: ${data.userName}`);
    }
  }
  process.exit(0);
}

check().catch(console.error);
