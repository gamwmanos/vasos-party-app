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
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple text-glow-cyan">
            {userName}
          </h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/")} className="p-3 bg-white/5 rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors">
            <span className="text-sm font-bold">HOME</span>
          </button>
          <button onClick={() => router.push("/gallery")} className="p-3 bg-white/5 rounded-full border border-white/10 text-neon-pink hover:bg-white/10 transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
          <button onClick={() => router.push("/leaderboard")} className="p-3 bg-white/5 rounded-full border border-white/10 text-neon-cyan hover:bg-white/10 transition-colors">
            <Trophy className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {QUESTS.map((quest) => {
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
    </main>
  );
}
