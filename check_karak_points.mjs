import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

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

const QUESTS = {
  q1:1,q2:1,q3:1,q4:1,q5:1,q6:1,q7:1,q8:1,q9:1,
  q10:4,q11:1,q12:2,q13:1,q14:2,q15:2,q16:2
};

async function checkKarak() {
  const snapshot = await getDocs(collection(db, "gallery"));
  let total = 0;
  for (const d of snapshot.docs) {
    const data = d.data();
    if ((data.userName || "").toLowerCase().includes("karak")) {
      const pts = QUESTS[data.questId] ?? 1;
      total += pts;
      console.log(`questId=${data.questId} | +${pts} pts`);
    }
  }
  console.log(`TOTAL: ${total} πόντοι`);
  process.exit(0);
}

checkKarak().catch(console.error);
