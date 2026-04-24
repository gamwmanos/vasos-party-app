"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Calendar, Clock, Sparkles, Camera, Trophy, ChevronDown, Music, Heart, Star } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [formMode, setFormMode] = useState<"register" | "login">("register");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  const { scrollYProgress } = useScroll();

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  const [hasSession, setHasSession] = useState(false);
  const [existingName, setExistingName] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("party_userId");
    const storedUserName = localStorage.getItem("party_userName");

    if (storedUserId && storedUserName) {
      setHasSession(true);
      setExistingName(storedUserName);
    }
    setIsLoading(false);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;

    let finalName = name.trim();
    const lowerName = finalName.toLowerCase();
    // Normalize Danai's variations to one account
    if (lowerName === "δανάη" || lowerName === "δαναη" || lowerName === "δανάη ραζή" || lowerName === "δαναη ραζη" || lowerName === "δανάη ραζη") {
      finalName = "Δανάη ραζη";
    }

    // Remove accents and make lowercase for the ID
    const normalizedNameForId = finalName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-');
    const newUserId = `${normalizedNameForId}-${pin.trim()}`;
    
    localStorage.setItem("party_userId", newUserId);
    localStorage.setItem("party_userName", finalName);

    router.push("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("party_userId");
    localStorage.removeItem("party_userName");
    setHasSession(false);
    setExistingName("");
    setName("");
    setPin("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-dark)]">
        <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin glow-pink mb-8"></div>
        <p className="text-neon-cyan font-bold animate-pulse text-xl">Loading the Party...</p>
      </div>
    );
  }

  return (
    <main className="bg-[var(--color-bg-dark)] text-white overflow-hidden relative">
      
      {/* Decorative Global Background Blobs - Casino Red/Gold */}
      <motion.div 
        style={{ rotate: bgRotate }}
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
      >
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(127,29,29,0.5)_0%,transparent_60%)] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_60%)] rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(192,57,43,0.25)_0%,transparent_60%)] rounded-full" />
      </motion.div>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative h-screen flex flex-col items-center justify-center pt-20 pb-10 z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image 
            src="/hero-bg.png" 
            alt="Party Background" 
            fill 
            className="object-cover object-center opacity-80"
            priority
          />
        </motion.div>

        <div className="z-20 text-center flex flex-col items-center px-4 w-full max-w-5xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-6 flex justify-center"
          >
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#0f5e22]/80 shadow-[0_0_30px_rgba(15,94,34,0.6)] relative glow-cyan">
              <Image src="/IMG_2251.png" alt="Vaso VIP" fill className="object-cover" priority />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase"
          >
            <span className="text-[#0f5e22] drop-shadow-[0_0_12px_rgba(15,94,34,0.6)] block mb-2">
              VASO'S
            </span>
            <span className="text-[#0ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.7)] text-5xl md:text-7xl">CASINO NIGHT</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl leading-relaxed"
          >
            Δεν είναι απλά ένα πάρτι. Είναι ένα παιχνίδι. Μπες, βρες τη Βασιλική, ολοκλήρωσε τα quests και κατάκτησε την κορυφή.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10 animate-bounce cursor-pointer"
            onClick={() => {
              document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ChevronDown className="w-12 h-12 text-neon-cyan opacity-80" />
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: PARTY DETAILS --- */}
      <section id="details" className="relative py-32 z-10 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Πού & Πότε;</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#c0392b] to-[#c0392b] mx-auto rounded-full glow-cyan"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Location */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-black/60 md:bg-[#1c0a0a]/80 backdrop-blur-sm md:backdrop-blur-lg border border-[#c0392b]/20 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-[#1c0a0a] transition-all hover:-translate-y-2 glow-purple group"
            >
              <div className="w-20 h-20 rounded-full bg-[#7f1d1d]/40 flex items-center justify-center mb-6 group-hover:bg-[#7f1d1d]/60 transition-colors">
                <MapPin className="w-10 h-10 text-[#c0392b]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Τοποθεσία</h3>
              <p className="text-gray-300 text-lg">
                Κίμωνος & Πρασίνου Λόφου,<br/> Άρτεμις 190 16
              </p>
            </motion.div>

            {/* Card 2: Date & Time */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-black/60 md:bg-[#1c0a0a]/80 backdrop-blur-sm md:backdrop-blur-lg border border-[#c0392b]/20 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-[#1c0a0a] transition-all hover:-translate-y-2 glow-pink group"
            >
              <div className="w-20 h-20 rounded-full bg-[#c0392b]/20 flex items-center justify-center mb-6 group-hover:bg-[#c0392b]/40 transition-colors">
                <Calendar className="w-10 h-10 text-[#c0392b]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Πότε</h3>
              <p className="text-gray-300 text-lg mb-2">Παρασκευή 24 Βράδυ</p>
              <div className="flex items-center gap-2 text-[#c0392b]">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Μετά τις 22:00</span>
              </div>
            </motion.div>

            {/* Card 3: Vibe */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-black/60 md:bg-[#1c0a0a]/80 backdrop-blur-sm md:backdrop-blur-lg border border-[#c0392b]/20 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-[#1c0a0a] transition-all hover:-translate-y-2 glow-pink group"
            >
              <div className="w-20 h-20 rounded-full bg-[#c0392b]/20 flex items-center justify-center mb-6 group-hover:bg-[#c0392b]/30 transition-colors">
                <Music className="w-10 h-10 text-[#c0392b]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Dress Code</h3>
              <p className="text-gray-300 text-lg">
                Αυστηρά All Black. Ετοιμάσου για το απόλυτο casino look!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: THE BIRTHDAY GIRL --- */}
      <section className="relative py-24 z-10 overflow-hidden bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-full md:w-1/2 relative h-[500px]"
          >
            {/* Image 1 (Back left) */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-[55%] aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#c0392b] shadow-2xl z-10 opacity-80 hover:opacity-100 transition-opacity hover:z-50"
            >
              <Image src="/tourta.jpg" alt="Vasiliki 1" fill sizes="(max-width: 768px) 55vw, 30vw" className="object-cover" />
              <div className="absolute inset-0 bg-[#c0392b]/10"></div>
            </motion.div>

            {/* Image 2 (Back right) */}
            <motion.div 
              animate={{ y: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-10 right-0 w-[55%] aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#7f1d1d] shadow-2xl z-20 opacity-80 hover:opacity-100 transition-opacity hover:z-50"
            >
              <Image src="/BASED.jpg" alt="Vasiliki 2" fill sizes="(max-width: 768px) 55vw, 30vw" className="object-cover" />
              <div className="absolute inset-0 bg-[#7f1d1d]/20"></div>
            </motion.div>

            {/* Image 3 (Front center) */}
            <motion.div 
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[65%] aspect-[4/5] rounded-3xl overflow-hidden border-4 border-[#c0392b] glow-pink z-30 shadow-2xl hover:scale-105 transition-transform"
            >
              <Image src="/IMG_2251.png" alt="Vasiliki 3" fill sizes="(max-width: 768px) 65vw, 40vw" className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#c0392b]/40 to-transparent opacity-60"></div>
            </motion.div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-1/2 -right-4 bg-[#c0392b] p-3 rounded-full shadow-xl border border-[#c0392b]/30 z-40"
            >
              <Heart className="w-6 h-6 text-white fill-white" />
            </motion.div>
          </motion.div>

          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#c0392b] to-[#e74c3c]">
              Who is the VIP?
            </h2>
            <h3 className="text-6xl font-black text-black drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">VASILIKI</h3>
            <p className="text-xl text-gray-300 leading-relaxed">
              Απόψε γιορτάζουμε. Και ο καλύτερος τρόπος για να το κάνουμε είναι να γεμίσουμε το κινητό της με άπειρες στιγμές, challenges και φωτογραφίες. Το #1 Quest όλων είναι να βρουν τη Βασιλική και να βγάλουν μια επική selfie μαζί της!
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <span className="px-6 py-2 rounded-full bg-[#c0392b]/10 border border-[#c0392b] text-[#c0392b] font-bold tracking-wider">#CASINO_ROYALE</span>
              <span className="px-6 py-2 rounded-full bg-[#c0392b]/10 border border-[#c0392b] text-[#c0392b] font-bold tracking-wider">#ALL_BLACK</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: HOW TO PLAY --- */}
      <section className="relative py-32 z-10 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Πώς Παίζεται το Παιχνίδι</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ολοκλήρωσε προκλήσεις (Quests) κατά τη διάρκεια του πάρτι, ανέβασε φωτογραφίες ως αποδεικτικά στοιχεία, και ανέβα στο Leaderboard!
            </p>
          </motion.div>

          <div className="space-y-16">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
            >
              <div className="w-32 h-32 flex-shrink-0 bg-[#7f1d1d]/30 rounded-full border-2 border-[#c0392b] flex items-center justify-center glow-purple relative">
                <span className="absolute -top-4 -left-4 w-12 h-12 bg-[#c0392b] rounded-full flex items-center justify-center text-2xl font-bold">1</span>
                <Sparkles className="w-16 h-16 text-[#c0392b]" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Δες τα Quests</h3>
                <p className="text-xl text-gray-400">Μπες στο Dashboard. Εκεί θα βρεις μια λίστα από προκλήσεις, όπως "Πιες 3 σφηνάκια σερί" ή "Βρες 3 τυχαίους για φωτογραφία".</p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 text-right md:text-left"
            >
              <div className="w-32 h-32 flex-shrink-0 bg-[#c0392b]/20 rounded-full border-2 border-[#c0392b] flex items-center justify-center glow-pink relative">
                <span className="absolute -top-4 -right-4 md:-right-auto md:-left-4 w-12 h-12 bg-[#c0392b] rounded-full flex items-center justify-center text-2xl font-bold text-white">2</span>
                <Camera className="w-16 h-16 text-[#c0392b]" />
              </div>
              <div className="md:text-right">
                <h3 className="text-3xl font-bold text-white mb-3">Βγάλε Φωτογραφία</h3>
                <p className="text-xl text-gray-400">Πατάς "Άνοιγμα Κάμερας" στο quest που κάνεις. Βγάζεις τη φωτογραφία επιτόπου για να αποδείξεις ότι τα κατάφερες!</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col md:flex-row items-center gap-8 md:gap-16"
            >
              <div className="w-32 h-32 flex-shrink-0 bg-[#c0392b]/20 rounded-full border-2 border-[#c0392b] flex items-center justify-center glow-cyan relative">
                <span className="absolute -top-4 -left-4 w-12 h-12 bg-[#c0392b] rounded-full flex items-center justify-center text-2xl font-bold text-black">3</span>
                <Trophy className="w-16 h-16 text-[#c0392b]" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Ανέβα στο Leaderboard</h3>
                <p className="text-xl text-gray-400">Η φωτογραφία σου ανεβαίνει στο Live Gallery του πάρτι. Κάθε Quest σου δίνει πόντους. Ποιος θα έχει το μεγαλύτερο σκορ στο τέλος της βραδιάς;</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: JOIN THE GAME (FORM) --- */}
      <section id="join" className="relative py-32 z-10 px-4 min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neon-purple/10 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-lg bg-[#0f0505]/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-[#c0392b]/40 glow-cyan relative z-10"
        >
          <div className="text-center mb-8">
            <Star className="w-12 h-12 text-[#c0392b] mx-auto mb-4 animate-pulse" />
            <h2 className="text-4xl font-black text-white mb-2">Ready?</h2>
            <p className="text-gray-400">Βάλε το όνομά σου για να μπεις στο παιχνίδι.</p>
          </div>

          {hasSession ? (
            <div className="space-y-6 text-center">
              <p className="text-xl text-gray-300">Έχεις ήδη μπει ως <strong className="text-neon-cyan">{existingName}</strong></p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#c0392b] via-[#7f1d1d] to-[#c0392b] text-white font-black text-2xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all glow-pink"
              >
                ΕΠΙΣΤΡΟΦΗ ΣΤΟ ΠΑΙΧΝΙΔΙ
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white underline mt-4 block mx-auto"
              >
                Δεν είσαι ο/η {existingName}; Αλλαγή Παίκτη
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormMode("register")}
                  className={`flex-1 py-3 text-sm md:text-base font-bold rounded-xl transition-all ${
                    formMode === "register" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-white"
                  }`}
                >
                  ΜΟΛΙΣ ΗΡΘΑ
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode("login")}
                  className={`flex-1 py-3 text-sm md:text-base font-bold rounded-xl transition-all ${
                    formMode === "login" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-white"
                  }`}
                >
                  ΕΧΩ ΞΑΝΑΜΠΕΙ
                </button>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-4">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={formMode === "register" ? "Το Όνομά σου (π.χ. Γιώργος)" : "Το Όνομα που είχες βάλει"}
                    className="w-full px-6 py-5 rounded-2xl bg-white/5 border-2 border-white/10 text-white text-xl placeholder:text-gray-500 focus:outline-none focus:border-[#c0392b] focus:bg-white/10 transition-all text-center font-bold"
                    required
                  />
                  
                  <input
                    id="pin"
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="4-ψήφιο PIN"
                    className="w-full px-6 py-5 rounded-2xl bg-white/5 border-2 border-white/10 text-white text-xl placeholder:text-gray-500 focus:outline-none focus:border-[#c0392b] focus:bg-white/10 transition-all text-center font-bold tracking-[0.5em]"
                    title="Βάλε 4 αριθμούς"
                    required
                  />
                  <p className="text-sm text-gray-400 text-center">
                    {formMode === "register" 
                      ? "Διάλεξε ένα μυστικό PIN 4 αριθμών για τον λογαριασμό σου." 
                      : "Βάλε το ίδιο PIN που είχες επιλέξει για να βρεις τον λογαριασμό σου."}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#c0392b] via-[#7f1d1d] to-[#c0392b] text-white font-black text-2xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all glow-pink mt-4 uppercase"
                >
                  {formMode === "register" ? "JOIN THE PARTY" : "ΕΠΙΣΤΡΟΦΗ"}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5 z-10 relative">
        <p className="text-gray-600 font-medium">© 2026 Vasiliki's Casino Night. Made with ❤️</p>
      </footer>
    </main>
  );
}
