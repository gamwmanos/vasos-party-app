"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { QUESTS, Quest } from "@/lib/quests";

interface NotificationModalProps {
  completedQuestIds: string[];
}

export default function NotificationModal({ completedQuestIds }: NotificationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedQuest, setSuggestedQuest] = useState<Quest | null>(null);

  useEffect(() => {
    // Show a notification every 10 minutes (600000 ms)
    // For testing purposes, you could change this to 10 seconds (10000 ms)
    const interval = setInterval(() => {
      // Find quests that are not yet completed
      const availableQuests = QUESTS.filter(q => !completedQuestIds.includes(q.id));
      
      if (availableQuests.length > 0) {
        // Pick a random available quest
        const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
        setSuggestedQuest(randomQuest);
        setIsOpen(true);
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [completedQuestIds]);

  return (
    <AnimatePresence>
      {isOpen && suggestedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="w-full max-w-sm bg-[var(--color-bg-card)] border border-neon-purple rounded-3xl p-6 glow-purple relative"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 bg-neon-purple/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-neon-purple" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2">Νέο Quest!</h3>
              <p className="text-gray-300 font-medium mb-6">Έχεις χρόνο να ολοκληρώσεις το παρακάτω;</p>
              
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-full mb-6">
                <h4 className="font-bold text-neon-pink mb-1">{suggestedQuest.title}</h4>
                <p className="text-sm text-gray-400">{suggestedQuest.description}</p>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                Πάμε να το κάνουμε!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
