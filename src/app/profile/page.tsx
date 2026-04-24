"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QUESTS } from "@/lib/quests";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Trophy, Camera } from "lucide-react";

interface MyPhoto {
  questId: string;
  imageUrl: string;
  timestamp: string;
  points: number;
  questTitle: string;
}

export default function MyProfile() {
  const router = useRouter();
  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const [userName, setUserName] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("party_userId");
    const storedUserName = localStorage.getItem("party_userName");

    if (!storedUserId || !storedUserName) {
      router.push("/");
      return;
    }

    setUserName(storedUserName);

    const q = query(collection(db, "gallery"), where("userId", "==", storedUserId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let pts = 0;
      const myPhotos: MyPhoto[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const quest = QUESTS.find(q => q.id === data.questId);
        const points = quest?.points ?? 1;
        pts += points;
        return {
          questId: data.questId,
          imageUrl: data.imageUrl,
          timestamp: data.timestamp,
          points,
          questTitle: quest?.title ?? data.questId,
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setPhotos(myPhotos);
      setTotalPoints(pts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-[var(--color-bg-dark)] p-4 pb-20">
      {/* Header */}
      <header className="flex items-center gap-4 py-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black text-white">Το Προφίλ μου</h1>
      </header>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1c0a0a] to-[#0f0505] border border-[#c0392b]/40 rounded-3xl p-6 mb-8 flex items-center gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-[#c0392b]/20 border-2 border-[#c0392b]/60 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-black text-white">{userName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-400 text-sm">Καλώς ήρθες,</p>
          <h2 className="text-2xl font-black text-white">{userName}</h2>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <Trophy className="w-5 h-5 text-[#c0392b]" />
            <span className="text-3xl font-black text-white">{totalPoints}</span>
          </div>
          <p className="text-gray-400 text-xs">ΠΟΝΤΟΙ</p>
        </div>
      </motion.div>

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">Φόρτωση...</div>
      ) : photos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Camera className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-xl font-bold">Δεν έχεις ανεβάσει ακόμα!</p>
          <p className="text-gray-600 mt-2">Ολοκλήρωσε ένα quest για να δεις τις φωτογραφίες σου εδώ.</p>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-[#c0392b]" />
            <h3 className="text-lg font-bold text-white">{photos.length} Φωτογραφίες</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.questId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40"
              >
                <div className="aspect-square relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.questTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-bold truncate">{photo.questTitle}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Trophy className="w-3 h-3 text-[#c0392b]" />
                    <span className="text-[#c0392b] text-xs font-black">+{photo.points} πόντοι</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
