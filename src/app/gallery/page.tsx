"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QUESTS } from "@/lib/quests";
import { motion } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(localStorage.getItem("party_userId"));
  }, []);

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

  const handleShareOrDownload = async (e: React.MouseEvent, item: GalleryItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloadingId === item.id) return;
    setDownloadingId(item.id);

    try {
      // Fetch the image via proxy to bypass CORS
      const proxyUrl = `/api/download?url=${encodeURIComponent(item.imageUrl)}&userName=${encodeURIComponent(item.userName)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const file = new File([blob], `party_photo_${item.userName}.jpg`, { type: blob.type || 'image/jpeg' });

      // Use Web Share API if supported (allows "Save Image" to Camera Roll)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Party Photo by ${item.userName}`,
        });
      } else {
        // Fallback to standard download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error: any) {
      // Ignore AbortError (user cancelled share)
      if (error.name !== 'AbortError') {
        console.error("Error sharing/downloading:", error);
        window.open(item.imageUrl, '_blank');
      }
    } finally {
      setDownloadingId(null);
    }
  };

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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c0392b] to-[#c0392b] text-glow-cyan">
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
                  <h3 className="text-xl font-bold text-[#c0392b]">{quest.title}</h3>
                  <p className="text-sm text-gray-400">{quest.description}</p>
                </div>
                
                {questItems.some(item => item.userId === currentUserId) ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {questItems.map((item, i) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative flex flex-col group"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
                          <img 
                            src={item.imageUrl} 
                            alt="Party photo" 
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <button 
                            onClick={(e) => handleShareOrDownload(e, item)}
                            disabled={downloadingId === item.id}
                            className={`absolute bottom-2 right-2 p-2 rounded-full border text-white transition-all active:scale-90 flex items-center justify-center ${
                              downloadingId === item.id 
                                ? 'bg-[#c0392b]/50 border-[#c0392b]/50 cursor-not-allowed' 
                                : 'bg-black/70 backdrop-blur-md border-white/20 hover:bg-[#c0392b]'
                            }`}
                            title="Αποθήκευση Φωτογραφίας"
                          >
                            <Download className={`w-4 h-4 ${downloadingId === item.id ? 'animate-pulse' : ''}`} />
                          </button>
                        </div>
                        <div className="mt-2 px-1 flex items-center justify-between">
                          <span className="text-gray-300 text-[10px] sm:text-xs font-medium truncate">
                            Από: <span className="text-white font-bold">{item.userName}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-[#c0392b]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-[#c0392b]/20 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <p className="text-white font-medium mb-1">Κρυφό Περιεχόμενο</p>
                    <p className="text-sm text-gray-400">Ανέβασε πρώτα τη δική σου φωτογραφία σε αυτό το quest για να δεις τι ανέβασαν οι άλλοι!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
