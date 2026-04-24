"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QUESTS } from "@/lib/quests";
import { ArrowLeft, Plus, Minus, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface PlayerScore {
  userId: string;
  userName: string;
  score: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("1");
  const [reason, setReason] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("party_userId");
    if (storedUserId !== "manos-7716") {
      router.push("/");
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "gallery"), (snapshot) => {
      const scores: Record<string, { userName: string; score: number }> = {};

      snapshot.docs.forEach(d => {
        const data = d.data();
        if (data.pending) return;
        if (!scores[data.userId]) {
          scores[data.userId] = { userName: data.userName, score: 0 };
        }
        let pts: number;
        if (data.points !== undefined) {
          pts = data.points;
        } else {
          const quest = QUESTS.find(q => q.id === data.questId);
          pts = quest?.points ?? 1;
        }
        scores[data.userId].score += pts;

        if (data.questId === "q13" && data.caughtUserId) {
          if (!scores[data.caughtUserId]) {
            scores[data.caughtUserId] = { userName: "Unknown", score: 0 };
          }
          scores[data.caughtUserId].score -= 3;
        }
      });

      // Also pull bonus adjustments
      const bonusUnsub = onSnapshot(collection(db, "adminAdjustments"), (bonusSnap) => {
        bonusSnap.docs.forEach(d => {
          const data = d.data();
          if (!scores[data.userId]) {
            scores[data.userId] = { userName: data.userName, score: 0 };
          }
          scores[data.userId].score += data.amount;
        });

        const sorted = Object.entries(scores)
          .map(([userId, { userName, score }]) => ({ userId, userName, score }))
          .sort((a, b) => b.score - a.score);

        setPlayers(sorted);
        setLoading(false);
      });

      return () => bonusUnsub();
    });

    return () => unsubscribe();
  }, [router]);

  const handleAdjust = async (player: PlayerScore, amount: number) => {
    if (saving) return;
    setSaving(true);
    try {
      const adjId = `${player.userId}_adj_${Date.now()}`;
      await setDoc(doc(db, "adminAdjustments", adjId), {
        userId: player.userId,
        userName: player.userName,
        amount,
        reason: reason || (amount > 0 ? "Admin bonus" : "Admin penalty"),
        timestamp: new Date().toISOString(),
      });
      setReason("");
      setAdjustUserId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (player: PlayerScore) => {
    if (!confirm(`Μηδενισμός ΟΛΩΝ των πόντων του/της ${player.userName};\nΘα διαγραφούν όλες οι φωτογραφίες και τα quests!`)) return;
    setSaving(true);
    try {
      // Remove from gallery
      const gallerySnap = await getDocs(collection(db, "gallery"));
      for (const d of gallerySnap.docs) {
        if (d.data().userId === player.userId) await deleteDoc(d.ref);
      }
      // Remove completedQuests
      const questsSnap = await getDocs(collection(db, "users", player.userId, "completedQuests"));
      for (const d of questsSnap.docs) await deleteDoc(d.ref);
      // Remove admin adjustments
      const adjSnap = await getDocs(collection(db, "adminAdjustments"));
      for (const d of adjSnap.docs) {
        if (d.data().userId === player.userId) await deleteDoc(d.ref);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-dark)] p-4 pb-24">
      <header className="flex items-center gap-4 py-4 mb-6 border-b border-white/10">
        <button onClick={() => router.push("/dashboard")} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">🛡️ Admin Panel</h1>
          <p className="text-gray-400 text-xs">Διαχείριση πόντων</p>
        </div>
      </header>

      {loading ? (
        <p className="text-gray-400 text-center mt-20">Φόρτωση...</p>
      ) : (
        <div className="space-y-4">
          {players.map((player, i) => (
            <motion.div
              key={player.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-400 w-6">#{i + 1}</span>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">{player.userName}</p>
                    <p className="text-xs text-gray-500">{player.userId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${player.score >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {player.score}
                  </span>
                  <p className="text-gray-400 text-xs">πόντοι</p>
                </div>
              </div>

              {/* Quick adjust buttons */}
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 5].map(n => (
                  <button
                    key={`+${n}`}
                    onClick={() => handleAdjust(player, n)}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-700/50 hover:bg-green-600 border border-green-500/30 text-green-300 rounded-lg text-sm font-bold transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />{n}
                  </button>
                ))}
                {[1, 2, 3, 5].map(n => (
                  <button
                    key={`-${n}`}
                    onClick={() => handleAdjust(player, -n)}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-800/50 hover:bg-red-700 border border-red-500/30 text-red-300 rounded-lg text-sm font-bold transition-all active:scale-95"
                  >
                    <Minus className="w-3 h-3" />{n}
                  </button>
                ))}
                <button
                  onClick={() => setAdjustUserId(adjustUserId === player.userId ? null : player.userId)}
                  className="px-3 py-1.5 bg-purple-800/50 hover:bg-purple-700 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-bold transition-all active:scale-95"
                >
                  Custom
                </button>
                <button
                  onClick={() => handleReset(player)}
                  disabled={saving}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-gray-800/80 hover:bg-red-900/60 border border-gray-600 hover:border-red-500/40 text-gray-400 hover:text-red-400 rounded-lg text-sm font-bold transition-all active:scale-95"
                  title="Μηδενισμός"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Custom amount panel */}
              {adjustUserId === player.userId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-24 bg-black/50 border border-purple-500/40 text-white p-2 rounded-lg text-center font-bold focus:outline-none"
                    placeholder="±"
                  />
                  <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 text-white p-2 rounded-lg text-sm focus:outline-none"
                    placeholder="Λόγος (προαιρετικό)..."
                  />
                  <button
                    onClick={() => handleAdjust(player, Number(customAmount))}
                    disabled={saving || !customAmount}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-lg transition-all active:scale-95 disabled:opacity-40"
                  >
                    OK
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
