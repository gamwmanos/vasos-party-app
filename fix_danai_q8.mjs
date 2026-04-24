import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

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

async function mergeQ8() {
  const querySnapshot = await getDocs(collection(db, "gallery"));
  
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (data.userId === "δανάη-ραζη-2222") {
      console.log(`Migrating ${document.id} to δαναη-ραζη-2222`);
      const newDocId = `δαναη-ραζη-2222_${data.questId}`;
      const newDocData = { ...data, userId: "δαναη-ραζη-2222" };
      
      await setDoc(doc(db, "gallery", newDocId), newDocData);
      
      if (document.id !== newDocId) {
        await deleteDoc(doc(db, "gallery", document.id));
      }
    }
  }

  // Handle users/ completedQuests
  const oldUserCompleted = await getDocs(collection(db, "users", "δανάη-ραζη-2222", "completedQuests"));
  for (const document of oldUserCompleted.docs) {
    console.log(`Moving completed quest: ${document.id}`);
    await setDoc(doc(db, "users", "δαναη-ραζη-2222", "completedQuests", document.id), document.data());
    await deleteDoc(doc(db, "users", "δανάη-ραζη-2222", "completedQuests", document.id));
  }
  
  try {
    await deleteDoc(doc(db, "users", "δανάη-ραζη-2222"));
  } catch (e) {}

  console.log("Done");
  process.exit(0);
}

mergeQ8().catch(console.error);
