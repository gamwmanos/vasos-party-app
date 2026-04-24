import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc, getDocs, collection } from "firebase/firestore";

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

async function findAndRemove() {
  // Find all users
  const snapshot = await getDocs(collection(db, "gallery"));
  const targets = [];
  
  for (const d of snapshot.docs) {
    const data = d.data();
    const name = (data.userName || "").toLowerCase();
    if ((name.includes("karak") || name.includes("καρακ") || name.includes("αχιλλ") || name.includes("achil")) && data.questId === "q11") {
      console.log(`Found q11: docId=${d.id} | userId=${data.userId} | userName=${data.userName}`);
      targets.push({ docId: d.id, userId: data.userId });
    }
  }
  
  for (const t of targets) {
    await deleteDoc(doc(db, "gallery", t.docId));
    console.log(`Deleted gallery/${t.docId}`);
    try {
      await deleteDoc(doc(db, "users", t.userId, "completedQuests", "q11"));
      console.log(`Deleted completedQuest q11 for ${t.userId}`);
    } catch(e) {
      console.log(`No completedQuest doc to delete for ${t.userId}`);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

findAndRemove().catch(console.error);
