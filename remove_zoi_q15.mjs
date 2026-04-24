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

async function removeZoiQ15() {
  const snapshot = await getDocs(collection(db, "gallery"));
  
  for (const d of snapshot.docs) {
    const data = d.data();
    const name = (data.userName || "").toLowerCase();
    if ((name.includes("ζω") || name.includes("zoi") || name.includes("ζωη") || name.includes("ζώη")) && data.questId === "q15") {
      console.log(`Found: docId=${d.id} | userId=${data.userId} | userName=${data.userName}`);
      await deleteDoc(doc(db, "gallery", d.id));
      console.log(`Deleted gallery/${d.id}`);
      try {
        await deleteDoc(doc(db, "users", data.userId, "completedQuests", "q15"));
        console.log(`Deleted completedQuest q15 for ${data.userId}`);
      } catch(e) {
        console.log(`No completedQuest to delete`);
      }
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

removeZoiQ15().catch(console.error);
