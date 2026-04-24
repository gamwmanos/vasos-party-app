import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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
  const querySnapshot = await getDocs(collection(db, "gallery"));
  const namesToDelete = ["δαναη", "μανο", "haja", "Δανάη", "Μάνο", "Μάνος", "Μανο", "Haja", "haja", "δανάη"];
  
  for (const document of querySnapshot.docs) {
    const data = document.data();
    if (namesToDelete.some(name => data.userName.toLowerCase() === name.toLowerCase())) {
      console.log("Deleting", data.userName, document.id);
      await deleteDoc(doc(db, "gallery", document.id));
    }
  }
  console.log("Done");
  process.exit(0);
}

clean().catch(console.error);
