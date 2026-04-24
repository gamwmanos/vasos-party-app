"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QUESTS } from "@/lib/quests";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface GalleryItem {
  id: string;
  userId: string;
  userName: string;
  questId: string;
  imageUrl: string;
  timestamp: string;
}

export default function Gallery() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      setItems(galleryData);
    });

    return () => unsubscribe();
  }, []);

  // Group items by questId
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.questId]) {
      acc[item.questId] = [];
    }
    acc[item.questId].push(item);
    return acc;
  }, {} as Record<string, GalleryItem[]>);

  return (
    <main className="min-h-screen bg-[var(--color-bg-dark)] p-4 pb-24">
      <header className="flex items-center gap-4 py-4 mb-6">
        <button onClick={() => router.push("/dashboard")} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan text-glow-pink">
          Live Gallery
        </h2>
      </header>

      {items.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">Ακόμα δεν έχει ανέβει καμία φωτογραφία. Γίνε ο πρώτος!</p>
      ) : (
        <div className="space-y-12">
          {QUESTS.map((quest) => {
            const questItems = groupedItems[quest.id];
            if (!questItems || questItems.length === 0) return null;

            return (
              <div key={quest.id} className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-xl font-bold text-neon-cyan">{quest.title}</h3>
                  <p className="text-sm text-gray-400">{quest.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {questItems.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group"
                    >
                      <img 
                        src={item.imageUrl} 
                        alt="Party photo" 
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <span className="text-white text-sm font-semibold truncate">{item.userName}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
