import { useState } from "react";
import { Camera, CheckCircle2, Lock, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";
import { Quest, QuestStatus } from "@/lib/quests";

interface QuestCardProps {
  quest: Quest;
  status: QuestStatus;
  onComplete: (file: File) => void;
  isUploading?: boolean;
}

export default function QuestCard({ quest, status, onComplete, isUploading }: QuestCardProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onComplete(selectedFile);
    }
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        status === "completed" && "bg-neon-cyan/10 border border-neon-cyan glow-cyan",
        status === "active" && "bg-white/10 border border-neon-pink glow-pink",
        status === "locked" && "bg-white/5 border border-white/10 opacity-60 grayscale"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{quest.title}</h3>
          <p className="text-gray-400 text-sm">{quest.description}</p>
        </div>
        
        {status === "completed" && (
          <CheckCircle2 className="w-8 h-8 text-neon-cyan flex-shrink-0" />
        )}
        {status === "locked" && (
          <Lock className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
        )}
      </div>

      {status === "active" && (
        <div className="mt-5">
          <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-pink text-white rounded-xl font-semibold cursor-pointer hover:bg-fuchsia-600 transition-colors active:scale-95">
            <Camera className="w-5 h-5" />
            {isUploading ? "Ανέβασμα..." : "Ανέβασμα Φωτογραφίας"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}

      {status === "completed" && (
        <div className="mt-5">
          <label className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-transparent border border-neon-cyan text-neon-cyan rounded-xl font-semibold cursor-pointer hover:bg-neon-cyan/20 transition-colors active:scale-95 text-sm">
            <RefreshCcw className="w-4 h-4" />
            {isUploading ? "Ανέβασμα..." : "Αντικατάσταση Φωτογραφίας"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
