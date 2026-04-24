"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { QUESTS, QuestStatus } from "@/lib/quests";
import QuestCard from "@/components/QuestCard";
import NotificationModal from "@/components/NotificationModal";
import { Trophy, Image as ImageIcon, User, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface NudesSubmission {
  docId: string;
  userId: string;
  userName: string;
  gender: string;
  imageUrl: string;
  timestamp: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [uploadingQuestId, setUploadingQuestId] = useState<string | null>(null);
  const [showHiddenUnlock, setShowHiddenUnlock] = useState(false);
  const [usersList, setUsersList] = useState<{ id: string; name: string }[]>([]);
  const [hasUnlockedHidden, setHasUnlockedHidden] = useState(false);
  const [nudesSubmissions, setNudesSubmissions] = useState<NudesSubmission[]>([]);
  const [pendingNudes, setPendingNudes] = useState(false); // current user has pending q17

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

    const unsubscribeQuests = onSnapshot(collection(db, "users", storedUserId, "completedQuests"), (snapshot) => {
      const completed = snapshot.docs.map(doc => doc.id);
      setCompletedQuests(completed);
    });

    const unsubscribeGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
      const usersMap = new Map<string, string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId && data.userName) {
          usersMap.set(data.userId, data.userName);
        }
      });
      usersMap.delete(storedUserId);
      const uniqueUsers = Array.from(usersMap.entries()).map(([id, name]) => ({ id, name }));
      setUsersList(uniqueUsers);
    });

    // Listen to nudes submissions
    const unsubscribeNudes = onSnapshot(collection(db, "nudesSubmissions"), (snapshot) => {
      const submissions: NudesSubmission[] = snapshot.docs.map(d => ({
        docId: d.id,
        ...(d.data() as Omit<NudesSubmission, 'docId'>)
      }));
      setNudesSubmissions(submissions);
      // Check if current user has a pending submission
      setPendingNudes(submissions.some(s => s.userId === storedUserId));
    });

    return () => {
      unsubscribeQuests();
      unsubscribeGallery();
      unsubscribeNudes();
    };
  }, [router]);

  const handleQuestComplete = async (questId: string, file: File, caughtUserId?: string, gender?: string) => {
    if (!userId || !userName) return;
    setUploadingQuestId(questId);

    try {
      const imageRef = ref(storage, `quests/${questId}/${userId}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);

      // Special handling for q17 (nudes) — save to pending collection
      if (questId === 'q17') {
        await setDoc(doc(db, "nudesSubmissions", `${userId}_q17`), {
          userId,
          userName,
          gender: gender || 'unknown',
          imageUrl,
          timestamp: new Date().toISOString(),
        });
        // Mark as "completed" locally so card shows pending state
        await setDoc(doc(db, "users", userId, "completedQuests", questId), {
          completedAt: new Date().toISOString(),
          imageUrl,
          pending: true,
        });
        return;
      }

      await setDoc(doc(db, "users", userId, "completedQuests", questId), {
        completedAt: new Date().toISOString(),
        imageUrl: imageUrl,
      });

      await setDoc(doc(db, "gallery", `${userId}_${questId}`), {
        userId,
        userName,
        questId,
        imageUrl,
        timestamp: new Date().toISOString(),
        ...(caughtUserId ? { caughtUserId } : {})
      }, { merge: true });

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Κάτι πήγε στραβά με το ανέβασμα!");
    } finally {
      setUploadingQuestId(null);
    }
  };

  // ADMIN: Approve a nudes submission
  const handleApproveNudes = async (submission: NudesSubmission) => {
    const points = submission.gender === 'female' ? 30 : -100;
    // Add to gallery with correct points
    await setDoc(doc(db, "gallery", `${submission.userId}_q17`), {
      userId: submission.userId,
      userName: submission.userName,
      questId: 'q17',
      imageUrl: submission.imageUrl,
      timestamp: submission.timestamp,
      points,
    });
    // Update completedQuests to remove pending flag
    await setDoc(doc(db, "users", submission.userId, "completedQuests", "q17"), {
      completedAt: submission.timestamp,
      imageUrl: submission.imageUrl,
      pending: false,
      points,
    });
    // Delete from pending
    await deleteDoc(doc(db, "nudesSubmissions", submission.docId));
  };

  // ADMIN: Remove a nudes submission (reject)
  const handleRemoveNudes = async (submission: NudesSubmission) => {
    await deleteDoc(doc(db, "nudesSubmissions", submission.docId));
    await deleteDoc(doc(db, "users", submission.userId, "completedQuests", "q17"));
  };

  // ADMIN: Manually award points to a user for q17
  const handleAwardManual = async (targetUserId: string, targetUserName: string, gender: string) => {
    const points = gender === 'female' ? 30 : -100;
    await setDoc(doc(db, "gallery", `${targetUserId}_q17`), {
      userId: targetUserId,
      userName: targetUserName,
      questId: 'q17',
      imageUrl: '',
      timestamp: new Date().toISOString(),
      points,
    });
    await setDoc(doc(db, "users", targetUserId, "completedQuests", "q17"), {
      completedAt: new Date().toISOString(),
      points,
    });
  };

  // ADMIN: Remove manually awarded points
  const handleRemoveManualAward = async (targetUserId: string) => {
    await deleteDoc(doc(db, "gallery", `${targetUserId}_q17`));
    await deleteDoc(doc(db, "users", targetUserId, "completedQuests", "q17"));
  };

  if (!userId) return null;

  const isAdmin = userId === 'manos-7716';

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
          <button onClick={() => router.push("/profile")} className="p-3 bg-white/5 rounded-full border border-white/10 text-[#c0392b] hover:bg-white/10 transition-colors">
            <User className="w-6 h-6" />
          </button>
          <button onClick={() => router.push("/gallery")} className="p-3 bg-white/5 rounded-full border border-white/10 text-[#c0392b] hover:bg-white/10 transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
          <button onClick={() => router.push("/leaderboard")} className="p-3 bg-white/5 rounded-full border border-white/10 text-[#c0392b] hover:bg-white/10 transition-colors">
            <Trophy className="w-6 h-6" />
          </button>
        </div>
      </header>

      )}

      {/* ADMIN PANEL: Award points for nudes (only manos-7716) */}
      {isAdmin && (
        <AdminNudesPanel
          submissions={nudesSubmissions}
          allUsers={usersList}
          onApprove={handleApproveNudes}
          onRemove={handleRemoveNudes}
          onAwardManual={handleAwardManual}
        />
      )}

      <div className="space-y-4">
        {QUESTS.map((quest) => {
          if (quest.isHidden && !hasUnlockedHidden && !completedQuests.includes(quest.id) && userId !== 'manos-7716') return null;
          // Admin sees q17 handled in the panel above, skip it here
          if (quest.id === 'q17' && isAdmin) return null;

          const isCompleted = completedQuests.includes(quest.id);
          const isThisQuestPending = quest.id === 'q17' && pendingNudes;
          const status: QuestStatus = isCompleted ? "completed" : "active";

          return (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <QuestCard
                quest={quest}
                status={status}
                isUploading={uploadingQuestId === quest.id}
                onComplete={(file, selectedUserId, gender) => handleQuestComplete(quest.id, file, selectedUserId, gender)}
                usersList={usersList}
                isPending={isThisQuestPending}
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
            <p className="text-gray-300 font-medium mb-6">Ξεκλείδωσες ένα μυστικό quest επειδή ολοκλήρωσες 4 προκλήσεις. Να είσαι διακριτικός όμως, η φωτό αυτή μετράει για τέσσερις πόντους! Αυτό είναι κρυφό quest, μη το μάθουν όλοι! 🤫</p>
            
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

// ---- Admin Nudes Panel Component ----
interface AdminNudesPanelProps {
  submissions: NudesSubmission[];
  allUsers: { id: string; name: string }[];
  onApprove: (sub: NudesSubmission) => void;
  onRemove: (sub: NudesSubmission) => void;
  onAwardManual: (userId: string, userName: string, gender: string) => void;
}

function AdminNudesPanel({ submissions, allUsers, onApprove, onRemove, onAwardManual }: AdminNudesPanelProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  return (
    <div className="mb-8 bg-[#1a0a2e]/80 border-2 border-purple-500/40 rounded-3xl p-5">
      <h3 className="text-purple-300 font-black text-xl mb-5">🔞 Admin — Nudes Quest</h3>

      {submissions.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm font-bold mb-3">PENDING ΕΓΚΡΙΣΗΣ:</p>
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div key={sub.docId} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-bold">{sub.userName}</p>
                  <p className={`text-xs font-black ${sub.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                    {sub.gender === 'female' ? '👧 +30 πόντοι' : '👦 -100 πόντοι'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onApprove(sub)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-sm active:scale-95 transition-all">
                    ✓ Δώσε
                  </button>
                  <button onClick={() => onRemove(sub)} className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-black rounded-xl text-sm active:scale-95 transition-all">
                    ✕ Αφαίρεσε
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-gray-400 text-sm font-bold mb-3">ΧΕΙΡΟΚΙΝΗΤΗ ΒΑΘΜΟΛΟΓΗΣΗ:</p>
      <div className="space-y-3">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full bg-black/50 border border-purple-500/40 text-white p-3 rounded-xl focus:outline-none"
        >
          <option value="">Επίλεξε χρήστη...</option>
          {allUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedGender('female')}
            className={`flex-1 py-3 rounded-xl font-black transition-all ${selectedGender === 'female' ? 'bg-pink-500 text-white' : 'bg-pink-500/10 border border-pink-500/40 text-pink-400'}`}
          >
            👧 Κορίτσι (+30)
          </button>
          <button
            onClick={() => setSelectedGender('male')}
            className={`flex-1 py-3 rounded-xl font-black transition-all ${selectedGender === 'male' ? 'bg-blue-500 text-white' : 'bg-blue-500/10 border border-blue-500/40 text-blue-400'}`}
          >
            👦 Αγόρι (-100)
          </button>
        </div>
        <button
          onClick={() => {
            if (!selectedUser || !selectedGender) return;
            const user = allUsers.find(u => u.id === selectedUser);
            if (user) onAwardManual(user.id, user.name, selectedGender);
            setSelectedUser('');
            setSelectedGender('');
          }}
          disabled={!selectedUser || !selectedGender}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black transition-all active:scale-95"
        >
          Δώσε Πόντους 🎯
        </button>
      </div>
    </div>
  );
}
