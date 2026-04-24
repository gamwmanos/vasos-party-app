"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { QUESTS, QuestStatus } from "@/lib/quests";
import QuestCard from "@/components/QuestCard";
import NotificationModal from "@/components/NotificationModal";
import { Trophy, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [uploadingQuestId, setUploadingQuestId] = useState<string | null>(null);
  const [showHiddenUnlock, setShowHiddenUnlock] = useState(false);
  const [hasUnlockedHidden, setHasUnlockedHidden] = useState(false);

  useEffect(() => {
    if (userId) {
       const unlocked = localStorage.getItem(`unlocked_q10_${userId}`);
       if (unlocked === "true") {
         setHasUnlockedHidden(true);
       }
    }
  }, [userId]);

  useEffect(() => {
    if (completedQuests.length >= 4 && !hasUnlockedHidden && userId) {
      setShowHiddenUnlock(true);
      setHasUnlockedHidden(true);
      localStorage.setItem(`unlocked_q10_${userId}`, "true");
    }
  }, [completedQuests.length, hasUnlockedHidden, userId]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("party_userId");
    const storedUserName = localStorage.getItem("party_userName");

    if (!storedUserId || !storedUserName) {
      router.push("/");
      return;
    }

    setUserId(storedUserId);
    setUserName(storedUserName);

    const unsubscribe = onSnapshot(collection(db, "users", storedUserId, "completedQuests"), (snapshot) => {
      const completed = snapshot.docs.map(doc => doc.id);
      setCompletedQuests(completed);
    });

    return () => unsubscribe();
  }, [router]);

  const handleQuestComplete = async (questId: string, file: File) => {
    if (!userId || !userName) return;
    setUploadingQuestId(questId);

    try {
      const imageRef = ref(storage, `quests/${questId}/${userId}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);

      await setDoc(doc(db, "users", userId, "completedQuests", questId), {
        completedAt: new Date().toISOString(),
        imageUrl: imageUrl,
      });

      await setDoc(doc(db, "gallery", `${userId}_${questId}`), {
        userId,
        userName,
        questId,
        imageUrl,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Κάτι πήγε στραβά με το ανέβασμα!");
    } finally {
      setUploadingQuestId(null);
    }
  };

  if (!userId) return null;

  return (
    <main className="min-h-screen bg-[var(--color-bg-dark)] p-4 pb-24">
      <header className="flex items-center justify-between py-4 mb-6 border-b border-white/10">
        <div>
          <p className="text-gray-400 text-sm">Player</p>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c0392b] to-[#e74c3c] text-glow-cyan">
            {userName}
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/")} className="p-3 bg-white/5 rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors">
            <span className="text-sm font-bold">HOME</span>
          </button>
          <button onClick={() => router.push("/gallery")} className="p-3 bg-white/5 rounded-full border border-white/10 text-[#c0392b] hover:bg-white/10 transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
          <button onClick={() => router.push("/leaderboard")} className="p-3 bg-white/5 rounded-full border border-white/10 text-[#c0392b] hover:bg-white/10 transition-colors">
            <Trophy className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {QUESTS.map((quest) => {
          if (quest.isHidden && !hasUnlockedHidden && !completedQuests.includes(quest.id) && userId !== 'manos-7716') return null;

          const isCompleted = completedQuests.includes(quest.id);
          const status: QuestStatus = isCompleted ? "completed" : "active";

          return (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <QuestCard
                quest={quest}
                status={status}
                isUploading={uploadingQuestId === quest.id}
                onComplete={(file) => handleQuestComplete(quest.id, file)}
              />
            </motion.div>
          );
        })}
      </div>
      
      {/* The pop-up that appears every 10 minutes */}
      <NotificationModal completedQuestIds={completedQuests} />

      {/* The pop-up for unlocking the hidden quest */}
      {showHiddenUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[var(--color-bg-card)] border-2 border-yellow-500/50 rounded-3xl p-6 text-center shadow-[0_0_30px_rgba(234,179,8,0.3)] relative"
          >
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50">
              <span className="text-4xl">🤫</span>
            </div>
            
            <h3 className="text-3xl font-black text-white mb-2">Κρυφό Quest!</h3>
            <p className="text-gray-300 font-medium mb-6">Ξεκλείδωσες ένα μυστικό quest επειδή ολοκλήρωσες 4 προκλήσεις. Να είσαι διακριτικός όμως, η φωτό αυτή μετράει για τρεις πόντους! Αυτό είναι κρυφό quest, μη το μάθουν όλοι! 🤫</p>
            
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-full mb-6 text-left">
              <h4 className="font-bold text-yellow-500 mb-1">Τα Αναφιώτικα</h4>
              <p className="text-sm text-gray-400">Ρώτα και μάθε για την ιστορία στα αναφιώτικα και ανέβασε μια φωτό που το κάνεις recreate με έναν φίλο σου!</p>
            </div>

            <button 
              onClick={() => setShowHiddenUnlock(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black hover:opacity-90 active:scale-95 transition-all"
            >
              Αποδοχή Πρόκλησης!
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}
