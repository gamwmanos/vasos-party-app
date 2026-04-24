import { useState } from "react";
import { Camera, CheckCircle2, Lock, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";
import { Quest, QuestStatus } from "@/lib/quests";

interface QuestCardProps {
  quest: Quest;
  status: QuestStatus;
  onComplete: (file: File, selectedUserId?: string) => void;
  isUploading?: boolean;
  usersList?: { id: string; name: string }[];
}

export default function QuestCard({ quest, status, onComplete, isUploading, usersList }: QuestCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "active" && quest.requiresUserSelection && !selectedUserId) {
      alert("Παρακαλώ επίλεξε πρώτα το άτομο από τη λίστα!");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onComplete(selectedFile, selectedUserId || undefined);
    }
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        status === "completed" && "bg-[#c0392b]/10 border border-[#c0392b] glow-cyan",
        status === "active" && "bg-white/10 border border-[#c0392b] glow-pink",
        status === "locked" && "bg-white/5 border border-white/10 opacity-60 grayscale"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{quest.title}</h3>
          <p className="text-gray-400 text-sm">{quest.description}</p>
        </div>
        
        {status === "completed" && (
          <CheckCircle2 className="w-8 h-8 text-[#c0392b] flex-shrink-0" />
        )}
        {status === "locked" && (
          <Lock className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
        )}
      </div>

      {quest.requiresUserSelection && status === "active" && usersList && (
        <div className="mt-4">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-black/50 border border-[#c0392b] text-white p-3 rounded-xl focus:outline-none focus:border-red-400"
          >
            <option value="">Επίλεξε ποιον έπιασες στα πράσσα...</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {status === "active" && (
        <div className="mt-5">
          <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#c0392b] text-white rounded-xl font-semibold cursor-pointer hover:bg-[#991b1b] transition-colors active:scale-95">
            <Camera className="w-5 h-5" />
            {isUploading ? "Ανέβασμα..." : "Ανέβασμα Φωτογραφίας"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || (status === "active" && quest.requiresUserSelection && !selectedUserId)}
            />
          </label>
        </div>
      )}

      {status === "completed" && (
        <div className="mt-5">
          <label className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-transparent border border-[#c0392b] text-[#c0392b] rounded-xl font-semibold cursor-pointer hover:bg-[#c0392b]/20 transition-colors active:scale-95 text-sm">
            <RefreshCcw className="w-4 h-4" />
            {isUploading ? "Ανέβασμα..." : "Αντικατάσταση Φωτογραφίας"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || (status === "active" && quest.requiresUserSelection && !selectedUserId)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
