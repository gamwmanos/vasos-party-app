"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Medal } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
}

export default function Leaderboard() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // We get all completed quests to calculate scores
    // A better approach for huge apps is Firebase Cloud Functions, 
    // but for a party, fetching the gallery and grouping by user is perfectly fine and fast.
    const q = query(collection(db, "gallery"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores: Record<string, { userName: string, score: number }> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!scores[data.userId]) {
          scores[data.userId] = { userName: data.userName, score: 0 };
        }
        scores[data.userId].score += 1;
      });

      const sortedLeaders = Object.entries(scores)
        .map(([userId, data]) => ({ userId, userName: data.userName, score: data.score }))
        .sort((a, b) => b.score - a.score);

      setLeaders(sortedLeaders);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-bg-dark)] p-4">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => router.push("/dashboard")} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#c0392b] text-glow-cyan">
          Leaderboard
        </h2>
      </header>

      {leaders.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">Ακόμα δεν έχει ολοκληρωθεί κανένα quest!</p>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          {leaders.map((leader, index) => (
            <motion.div 
              key={leader.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden"
            >
              {index === 0 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent pointer-events-none" />}
              
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 flex items-center justify-center font-black text-xl rounded-full bg-black/30 border border-white/10">
                  {index === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> : 
                   index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> : 
                   index === 2 ? <Medal className="w-6 h-6 text-amber-700" /> : 
                   <span className="text-gray-500">{index + 1}</span>}
                </div>
                <span className="text-lg font-bold text-white">{leader.userName}</span>
              </div>
              
              <div className="z-10 flex flex-col items-end">
                <span className="text-3xl font-black text-[#d4af37] text-glow-cyan">{leader.score}</span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Quests</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
