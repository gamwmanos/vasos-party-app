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

async function migrate() {
  const querySnapshot = await getDocs(collection(db, "gallery"));
  const usersToMigrate = new Set();
  
  for (const document of querySnapshot.docs) {
    const data = document.data();
    
    // We get the PIN by looking at the last part of userId
    const parts = data.userId.split('-');
    const pin = parts.pop();
    
    // Normalize name to be accent-less and lowercase
    const normalizedNameForId = data.userName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-');
    const newUserId = `${normalizedNameForId}-${pin}`;
    
    if (newUserId !== data.userId) {
      console.log(`Migrating item: ${document.id} from ${data.userId} to ${newUserId}`);
      usersToMigrate.add(JSON.stringify({ oldId: data.userId, newId: newUserId }));
      
      const newDocId = `${newUserId}_${data.questId}`;
      const newDocData = { ...data, userId: newUserId };
      
      await setDoc(doc(db, "gallery", newDocId), newDocData);
      
      if (document.id !== newDocId) {
        await deleteDoc(doc(db, "gallery", document.id));
      }
    }
  }

  // Migrate completedQuests subcollections
  for (const userStr of usersToMigrate) {
    const { oldId, newId } = JSON.parse(userStr);
    console.log(`Migrating user completed quests from ${oldId} to ${newId}`);
    
    const oldUserCompleted = await getDocs(collection(db, "users", oldId, "completedQuests"));
    for (const completedDoc of oldUserCompleted.docs) {
      await setDoc(doc(db, "users", newId, "completedQuests", completedDoc.id), completedDoc.data());
      await deleteDoc(doc(db, "users", oldId, "completedQuests", completedDoc.id));
    }
    
    // Attempt to delete old user doc if exists
    try {
      await deleteDoc(doc(db, "users", oldId));
    } catch (e) {
      // It's okay if user doc doesn't exist directly
    }
  }
  
  console.log("Migration complete");
  process.exit(0);
}

migrate().catch(console.error);
