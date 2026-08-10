"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const offset = circumference * (1 - animatedValue / 100);

  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={radius} stroke="#E4DFD0" strokeWidth="6" fill="none" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          stroke="#4C7A2E"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-medium">
        {value}%
      </div>
    </div>
  );
}

function SeverityMeter({ level }: { level: "mild" | "moderate" | "severe" | "healthy" }) {
  const positions = { mild: "16%", moderate: "50%", severe: "84%", healthy: "16%" };
  const displayLevel = level === "healthy" ? "none" : level;
  return (
    <div className="flex-1">
      <div className="text-xs text-[#6B7264] mb-1.5">
        severity — <span className="text-[#1F2E1A] font-medium">{displayLevel}</span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-[#4C7A2E] via-[#C48A2E] to-[#B5502A]">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#1F2E1A] shadow"
          initial={{ left: "0%" }}
          animate={{ left: positions[level] }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ marginLeft: "-6px" }}
        />
      </div>
    </div>
  );
}

type Stage = "idle" | "uploading" | "scanning" | "done";

type WeatherData = {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  city: string;
};

type PredictionResult = {
  disease: string;
  raw_label: string;
  confidence: number;
  severity: "mild" | "moderate" | "severe" | "healthy";
  healthy: boolean;
  advisory: string;
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("idle");
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/sign-in");
      } else {
        setAuthChecked(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/sign-in");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      setMouse({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setWeatherError(true);
        } else {
          setWeather(data);
        }
      })
      .catch(() => setWeatherError(true));
  }, []);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload an image file (JPG, PNG, or WEBP). That file type isn't supported.");
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`That image is too large. Please upload something under ${maxSizeMB}MB.`);
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStage("uploading");
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(Math.min(p, 95));
    }, 100);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStage("scanning");

      const res = await fetch("https://fieldscan-backend.fastapicloud.dev/predict", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        setError("The model couldn't process this image. Please try another one.");
        setStage("idle");
        return;
      }

      const data = await res.json();
      setResult(data);
      setStage("done");
    } catch (err) {
      clearInterval(interval);
      setError("Couldn't reach the detection server. Is the backend running?");
      setStage("idle");
    }
  }

  function resetScan() {
    setStage("idle");
    setPreviewUrl(null);
    setProgress(0);
    setError(null);
    setResult(null);
    setActiveTab("overview");
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4C7A2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1F2E1A] font-sans relative">
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full border border-[#4C7A2E]/40 pointer-events-none z-50 hidden md:block"
        animate={{ x: mouse.x - 12, y: mouse.y - 12 }}
        transition={{ type: "spring", damping: 30, stiffness: 250, mass: 0.4 }}
      />

      <header className="flex justify-between items-center px-8 py-3 sticky top-0 z-20 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_20px_rgba(0,0,0,0.03)]">
        <div className="text-xl font-semibold tracking-tight">
          field<span className="text-[#4C7A2E]">scan</span>
        </div>
        <nav className="flex items-center gap-7 text-sm text-[#6B7264]">
          <a href="#" className="relative group">
            scan
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#4C7A2E] group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#" className="relative group">
            history
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#4C7A2E] group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#" className="relative group">
            advisory log
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#4C7A2E] group-hover:w-full transition-all duration-300" />
          </a>
          <div className="flex items-center gap-3 ml-3 pl-3 border-l border-[#E4DFD0]">
            <button className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition text-[#6B7264]">
              <IconSearch />
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition text-[#6B7264]">
              <IconBell />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#4C7A2E] text-white text-xs flex items-center justify-center font-medium">
              A
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-5 pb-16">
        {/* Hero */}
        <section className="relative rounded-3xl overflow-hidden h-[480px] mt-8 mb-6">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/hero-field.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

          <div className="absolute inset-0 flex flex-col justify-end p-12">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-widest text-[#CFE3B8] mb-3"
            >
              crop health advisory
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-medium text-white max-w-xl leading-tight">
              {"Read the leaf before the field tells you.".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex gap-3 mt-7"
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-[#4C7A2E] text-white rounded-full text-sm font-medium hover:bg-[#3E6423] transition"
              >
                Scan Leaf
              </button>
              <button className="px-6 py-3 bg-white/10 backdrop-blur border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/20 transition">
                Live Demo
              </button>
              <button className="px-6 py-3 text-white/80 rounded-full text-sm font-medium hover:text-white transition">
                Learn More →
              </button>
            </motion.div>
          </div>
        </section>

        {/* Stats bar */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-4 gap-3 mb-10"
        >
          {[
            { val: "12,400", lab: "scans analyzed" },
            { val: "91.6%", lab: "model accuracy" },
            { val: "15", lab: "disease classes" },
            { val: "2s", lab: "avg inference" },
          ].map((s) => (
            <div key={s.lab} className="bg-white border border-[#E4DFD0] rounded-2xl p-4">
              <div className="text-2xl font-semibold text-[#4C7A2E]">{s.val}</div>
              <div className="text-xs text-[#6B7264] mt-1">{s.lab}</div>
            </div>
          ))}
        </motion.section>

        {/* Weather + Trends */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-[280px_1fr] gap-4 mb-10"
        >
          <div className="bg-white border border-[#E4DFD0] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-[#6B7264] mb-1">field conditions</p>

            {weatherError && (
              <p className="text-sm text-[#B5502A] py-6">Weather data unavailable right now.</p>
            )}

            {!weather && !weatherError && (
              <div className="space-y-2 animate-pulse py-2">
                <div className="h-8 bg-[#F2EEE3] rounded w-2/3"></div>
                <div className="h-3 bg-[#F2EEE3] rounded w-1/2"></div>
              </div>
            )}

            {weather && (
              <>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-semibold">{weather.temp}°</span>
                  <span className="text-sm text-[#6B7264] mb-1">{weather.city}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <p className="text-[#6B7264]">humidity</p>
                    <p className="font-medium mt-0.5">{weather.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-[#6B7264]">wind</p>
                    <p className="font-medium mt-0.5">{weather.windSpeed} km/h</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#6B7264]">condition</p>
                    <p className="font-medium mt-0.5">{weather.condition}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#E4DFD0]">
                  <p className="text-xs text-[#6B7264] mb-1.5">disease risk today</p>
                  <div className="h-1.5 rounded-full bg-[#E4DFD0] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: weather.humidity > 60 ? "70%" : "35%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full bg-[#C48A2E] rounded-full"
                    />
                  </div>
                  <p className="text-xs text-[#C48A2E] mt-1 font-medium">
                    {weather.humidity > 60 ? "elevated" : "low"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white border border-[#E4DFD0] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-[#6B7264] mb-1">disease trends</p>
            <p className="text-sm font-medium mb-4">Detections over the last 6 weeks</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={[
                  { week: "W1", cases: 12 },
                  { week: "W2", cases: 19 },
                  { week: "W3", cases: 15 },
                  { week: "W4", cases: 27 },
                  { week: "W5", cases: 22 },
                  { week: "W6", cases: 31 },
                ]}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="#E4DFD0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6B7264" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7264" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E4DFD0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#4C7A2E"
                  strokeWidth={2.5}
                  dot={{ fill: "#4C7A2E", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-4 bg-[#F5E2D8] border border-[#B5502A]/30 text-[#B5502A] text-sm rounded-xl px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <IconAlert />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-xs underline shrink-0">
                dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full mb-10 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                dragOver ? "border-[#4C7A2E] bg-[#F5F9EF]" : "border-[#E4DFD0] bg-white hover:border-[#7FA75A]"
              }`}
            >
              <motion.div
                animate={{ y: dragOver ? -4 : 0 }}
                className="w-14 h-14 rounded-2xl bg-[#F2EEE3] flex items-center justify-center text-[#4C7A2E]"
              >
                <IconUpload />
              </motion.div>
              <div className="text-center">
                <p className="font-medium text-sm">Drag and drop a leaf photo, or click to browse</p>
                <p className="text-xs text-[#6B7264] mt-1">JPG, PNG, or WEBP — up to 10MB</p>
              </div>
            </motion.div>
          )}

          {stage === "uploading" && previewUrl && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mb-10 bg-white border border-[#E4DFD0] rounded-2xl p-6 flex items-center gap-5"
            >
              <img src={previewUrl} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Uploading image...</p>
                <div className="h-1.5 bg-[#F2EEE3] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#4C7A2E] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <p className="text-xs text-[#6B7264] mt-1">{progress}%</p>
              </div>
            </motion.div>
          )}

          {stage === "scanning" && previewUrl && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mb-10 bg-white border border-[#E4DFD0] rounded-2xl p-8 flex items-center gap-8"
            >
              <div className="relative w-56 h-56 rounded-xl overflow-hidden shrink-0">
                <img src={previewUrl} alt="scanning" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(76,122,46,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(76,122,46,0.6) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                {[
                  "top-2 left-2 border-t-2 border-l-2",
                  "top-2 right-2 border-t-2 border-r-2",
                  "bottom-2 left-2 border-b-2 border-l-2",
                  "bottom-2 right-2 border-b-2 border-r-2",
                ].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-5 h-5 border-[#4C7A2E] rounded-sm`} />
                ))}
                <motion.div
                  className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-[#4C7A2E]/35 to-transparent"
                  animate={{ top: ["-15%", "95%", "-15%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute left-0 right-0 h-[2.5px] bg-[#8FD14F]"
                  style={{ boxShadow: "0 0 20px 4px rgba(143,209,79,0.9), 0 0 40px 8px rgba(76,122,46,0.5)" }}
                  animate={{ top: ["4%", "96%", "4%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-[#8FD14F] rounded-xl"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Analyzing leaf structure</p>
                <p className="text-xs text-[#6B7264] mb-4">
                  Running EfficientNet-B0 inference and generating a Grad-CAM overlay.
                </p>
                <div className="space-y-2">
                  {["Detecting leaf boundary", "Extracting texture features", "Matching against 15 disease classes"].map(
                    (step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
                        className="flex items-center gap-2 text-xs text-[#6B7264]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#4C7A2E]" />
                        {step}
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {stage === "done" && previewUrl && result && (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-[#E4DFD0] rounded-2xl p-8 mb-10 grid grid-cols-[240px_1fr] gap-8 relative"
            >
              <button
                onClick={resetScan}
                className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#6B7264] transition"
              >
                <IconX />
              </button>
              <div className="relative w-full h-60 rounded-xl overflow-hidden border border-[#E4DFD0]">
                <img src={previewUrl} alt="result" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className={`flex items-center gap-2 text-xs uppercase font-mono mb-1 ${result.healthy ? "text-[#4C7A2E]" : "text-[#B5502A]"}`}>
                  <IconCheck /> {result.healthy ? "no disease detected" : "disease detected"}
                </div>
                <h2 className="text-2xl font-semibold mt-1 mb-4">{result.disease}</h2>

                <div className="flex items-center gap-5 mb-5">
                  <ConfidenceGauge value={result.confidence} />
                  <SeverityMeter level={result.severity} />
                </div>

                <div className="flex gap-2 border-b border-[#E4DFD0] mb-4">
                  {["overview", "treatment", "raw"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`text-sm pb-2 px-1 mr-4 border-b-2 ${
                        activeTab === t
                          ? "text-[#4C7A2E] border-[#4C7A2E] font-medium"
                          : "text-[#6B7264] border-transparent"
                      }`}
                    >
                      {t === "overview" ? "overview" : t === "treatment" ? "treatment plan" : "raw output"}
                    </button>
                  ))}
                </div>

                {activeTab === "overview" && (
                  <div className="space-y-3 text-sm">
                    <p><span className="text-[#6B7264]">prediction:</span> {result.disease}</p>
                    <p><span className="text-[#6B7264]">model confidence:</span> {result.confidence}%</p>
                    <p><span className="text-[#6B7264]">status:</span> {result.healthy ? "Plant appears healthy" : "Disease pattern detected"}</p>
                  </div>
                )}
                {activeTab === "treatment" && (
                  <div className="bg-[#F2EEE3] border-l-2 border-[#4C7A2E] rounded-r-lg p-4 text-sm leading-relaxed whitespace-pre-line">
                    {result.advisory}
                  </div>
                )}
                {activeTab === "raw" && (
                  <pre className="bg-[#F2EEE3] rounded-lg p-4 text-xs font-mono whitespace-pre-wrap break-words">
{JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-4 gap-4"
        >
          {[
            { n: "01", t: "Detection", d: "CNN classifies disease with Grad-CAM overlay." },
            { n: "02", t: "Severity", d: "Estimates mild, moderate or severe." },
            { n: "03", t: "Advisory", d: "Structured treatment plan via Gemini API." },
            { n: "04", t: "Forecast", d: "7-day spread risk from weather data." },
          ].map((m) => (
            <div key={m.n} className="bg-white border border-[#E4DFD0] rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="text-xs font-mono text-[#7FA75A] mb-2">{m.n}</div>
              <h4 className="font-medium text-sm mb-1">{m.t}</h4>
              <p className="text-xs text-[#6B7264]">{m.d}</p>
            </div>
          ))}
        </motion.section>
      </main>
    </div>
  );
}