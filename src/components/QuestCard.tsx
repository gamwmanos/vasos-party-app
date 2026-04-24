import { useState } from "react";
import { Camera, CheckCircle2, Lock, RefreshCcw, Clock } from "lucide-react";
import { clsx } from "clsx";
import { Quest, QuestStatus } from "@/lib/quests";

interface QuestCardProps {
  quest: Quest;
  status: QuestStatus;
  onComplete: (file: File, selectedUserId?: string, gender?: string) => void;
  isUploading?: boolean;
  usersList?: { id: string; name: string }[];
  isPending?: boolean;
}

export default function QuestCard({ quest, status, onComplete, isUploading, usersList, isPending }: QuestCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "active" && quest.requiresUserSelection && !selectedUserId) {
      alert("Παρακαλώ επίλεξε πρώτα το άτομο από τη λίστα!");
      return;
    }
    if (status === "active" && quest.requiresGenderSelection && !selectedGender) {
      alert("Παρακαλώ επίλεξε πρώτα το φύλο σου!");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onComplete(selectedFile, selectedUserId || undefined, selectedGender || undefined);
    }
  };

  // Points badge — hide for admin approval quests (variable points)
  const showPointsBadge = !quest.requiresAdminApproval && (quest.points !== undefined);
  const pts = quest.points ?? 1;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300",
        status === "completed" && !isPending && "bg-[#c0392b]/10 border border-[#c0392b] glow-cyan",
        isPending && "bg-yellow-900/20 border border-yellow-500/50",
        status === "active" && "bg-white/10 border border-[#c0392b] glow-pink",
        status === "locked" && "bg-white/5 border border-white/10 opacity-60 grayscale"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-xl font-bold text-white">{quest.title}</h3>
            {showPointsBadge && (
              <span className="flex items-center gap-1 bg-[#c0392b]/20 border border-[#c0392b]/50 text-[#e74c3c] text-xs font-black px-2 py-0.5 rounded-full">
                ⭐ {pts} {pts === 1 ? "πόντος" : "πόντοι"}
              </span>
            )}
            {quest.requiresAdminApproval && (
              <span className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-black px-2 py-0.5 rounded-full">
                🔞 ADMIN ONLY
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{quest.description}</p>
        </div>
        
        {status === "completed" && !isPending && (
          <CheckCircle2 className="w-8 h-8 text-[#c0392b] flex-shrink-0" />
        )}
        {isPending && (
          <Clock className="w-8 h-8 text-yellow-400 flex-shrink-0" />
        )}
        {status === "locked" && (
          <Lock className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
        )}
      </div>

      {/* Dropdown for catching someone doing handstand */}
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

      {/* Gender selector for admin approval quest */}
      {quest.requiresGenderSelection && status === "active" && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedGender("female")}
            className={clsx(
              "flex-1 py-3 rounded-xl font-black text-lg transition-all",
              selectedGender === "female"
                ? "bg-pink-500 text-white scale-105"
                : "bg-pink-500/10 border border-pink-500/40 text-pink-400"
            )}
          >
            👧 Κορίτσι (+30)
          </button>
          <button
            type="button"
            onClick={() => setSelectedGender("male")}
            className={clsx(
              "flex-1 py-3 rounded-xl font-black text-lg transition-all",
              selectedGender === "male"
                ? "bg-blue-500 text-white scale-105"
                : "bg-blue-500/10 border border-blue-500/40 text-blue-400"
            )}
          >
            👦 Αγόρι (-100)
          </button>
        </div>
      )}

      {/* Pending state */}
      {isPending && (
        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
          <p className="text-yellow-400 font-bold text-sm">⏳ Αναμονή έγκρισης από τον Μανο...</p>
        </div>
      )}

      {status === "active" && !isPending && (
        <div className="mt-5">
          <label className={clsx(
            "flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold cursor-pointer transition-colors active:scale-95",
            (quest.requiresGenderSelection && !selectedGender) || (quest.requiresUserSelection && !selectedUserId)
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#c0392b] text-white hover:bg-[#991b1b]"
          )}>
            <Camera className="w-5 h-5" />
            {isUploading ? "Ανέβασμα..." : "Ανέβασμα Φωτογραφίας"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || (status === "active" && quest.requiresUserSelection && !selectedUserId) || (status === "active" && quest.requiresGenderSelection && !selectedGender)}
            />
          </label>
        </div>
      )}

      {status === "completed" && !isPending && (
        <div className="mt-5">
          <label className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-transparent border border-[#c0392b] text-[#c0392b] rounded-xl font-semibold cursor-pointer hover:bg-[#c0392b]/20 transition-colors active:scale-95 text-sm">
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
