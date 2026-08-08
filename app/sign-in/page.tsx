"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconEyeOpen() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 4.22-5.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a20.3 20.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function BrandMark({ dark = false }: { dark?: boolean }) {
  const stroke = dark ? "#1F2E1A" : "#FFFFFF";
  return (
    <div
      className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
        dark ? "border-[#1F2E1A]/20" : "border-white/30"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" />
        <path d="M12 7c-3 0-5.5 1.8-6.5 4.5C7 12.5 9.5 13 12 13" />
        <path d="M12 13c2.5 0 5-.5 6.5-1.5C17.5 8.8 15 7 12 7" />
      </svg>
    </div>
  );
}

type Mode = "signin" | "signup";

function FloatingField({
  label,
  value,
  onChange,
  error,
  isPassword = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  isPassword?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const active = focused || value.length > 0;
  const inputType = isPassword ? (visible ? "text" : "password") : "email";

  return (
    <div className="relative pt-4">
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-transparent border-b outline-none text-sm text-[#1F2E1A] pb-2 pt-2 transition-colors ${
          isPassword ? "pr-8" : ""
        } ${
          error
            ? "border-[#B5502A]"
            : "border-[#E4DFD0] hover:border-[#B8CBA0] focus:border-[#4C7A2E]"
        }`}
      />
      <motion.label
        initial={false}
        animate={{
          y: active ? -22 : 0,
          scale: active ? 0.8 : 1,
          color: error ? "#B5502A" : focused ? "#4C7A2E" : "#6B7264",
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ originX: 0 }}
        className="absolute left-0 top-4 text-sm pointer-events-none"
      >
        {label}
      </motion.label>

      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-4 text-[#6B7264] hover:text-[#4C7A2E] transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <IconEyeOpen /> : <IconEyeClosed />}
        </button>
      )}

      {error && <p className="text-xs text-[#B5502A] mt-1">{error}</p>}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specimenCount, setSpecimenCount] = useState(12400);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setSpecimenCount((c) => c + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function switchMode(m: Mode) {
    setMode(m);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFieldErrors({});
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (mode === "signup" && !isStrongPassword(password)) {
      errors.password = "At least 8 characters, with letters and numbers.";
    } else if (mode === "signin" && password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(
            error.message.includes("Invalid login credentials")
              ? "Incorrect email or password."
              : error.message
          );
          setLoading(false);
          return;
        }

        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(
            error.message.includes("already registered")
              ? "An account with this email already exists."
              : error.message
          );
          setLoading(false);
          return;
        }

        setSuccessMsg("Account created. Check your email to confirm before signing in.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please check your connection and try again.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg("Couldn't start Google sign-in. Please try again.");
    }
  }

  const headline = mode === "signin" ? "Welcome." : "Get started.";
  const sub =
    mode === "signin"
      ? "Sign in to see your scan history and advisory log."
      : "Create an account to start diagnosing your crops.";

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero-field.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/75" />

        <motion.div
          className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#8FD14F]/15 to-transparent pointer-events-none"
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 6, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-[#8FD14F]/70 pointer-events-none"
          style={{ boxShadow: "0 0 16px 2px rgba(143,209,79,0.6)" }}
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 6, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />

        <div className="relative flex items-center gap-3 text-white">
          <BrandMark />
          <span className="text-2xl font-semibold tracking-tight">
            field<span className="text-[#8FD14F]">scan</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#CFE3B8] mb-4">
            crop health advisory
          </p>

          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-[2.5rem] leading-[1.1] font-medium text-white tracking-tight"
            >
              {headline}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={mode + "-sub"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="text-[15px] text-white/70 mt-4 max-w-sm leading-relaxed"
            >
              {sub}
            </motion.p>
          </AnimatePresence>

          <div className="mt-10 pt-6 border-t border-white/15 flex items-center gap-2 text-white/60 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FD14F]" />
            Specimen No. {specimenCount.toLocaleString()} logged today
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-10 text-[#1F2E1A]">
            <BrandMark dark />
            <span className="text-2xl font-semibold tracking-tight">
              field<span className="text-[#4C7A2E]">scan</span>
            </span>
          </div>

          <h2 className="text-2xl font-medium text-[#1F2E1A] mb-1">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h2>
          <p className="text-sm text-[#6B7264] mb-8">
            {mode === "signin"
              ? "Enter your details to continue."
              : "Takes less than a minute."}
          </p>

          <div className="relative flex mb-8 border-b border-[#E4DFD0]">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`relative pb-3 px-1 mr-8 text-sm font-medium transition-colors hover:text-[#1F2E1A] ${
                  mode === m ? "text-[#1F2E1A]" : "text-[#6B7264]"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
                {mode === m && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#4C7A2E]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "signup" ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signup" ? -12 : 12 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 flex items-center gap-2 bg-[#F5E2D8] border border-[#B5502A]/30 text-[#B5502A] text-xs rounded-lg px-3 py-2.5"
                  >
                    <IconAlert />
                    {errorMsg}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 flex items-center gap-2 bg-[#EAF3E1] border border-[#4C7A2E]/30 text-[#4C7A2E] text-xs rounded-lg px-3 py-2.5"
                  >
                    <IconCheck />
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 border border-[#E4DFD0] rounded-full py-3 text-sm font-medium text-[#1F2E1A] hover:bg-[#F5F9EF] hover:border-[#7FA75A] hover:shadow-sm transition-all mb-6"
              >
                <IconGoogle />
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#E4DFD0]" />
                <span className="text-xs text-[#6B7264] uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-[#E4DFD0]" />
              </div>

              <div className="space-y-1">
                <FloatingField label="Email" value={email} onChange={setEmail} error={fieldErrors.email} />
                <FloatingField label="Password" value={password} onChange={setPassword} error={fieldErrors.password} isPassword />
                {mode === "signup" && (
                  <FloatingField
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    error={fieldErrors.confirmPassword}
                    isPassword
                  />
                )}
              </div>

              {mode === "signup" && (
                <p className="text-xs text-[#6B7264] mt-3">
                  Use at least 8 characters, with a mix of letters and numbers.
                </p>
              )}

              {mode === "signin" && (
                <div className="text-right mt-3">
                  <a href="#" className="text-xs text-[#6B7264] hover:text-[#4C7A2E] transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-[#4C7A2E] text-white rounded-full py-3 text-sm font-medium hover:bg-[#3E6423] hover:shadow-md transition-all group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {loading ? (
                  "Please wait..."
                ) : (
                  <>
                    {mode === "signin" ? "Sign in" : "Create account"}
                    <span className="transition-transform group-hover:translate-x-1">
                      <IconArrow />
                    </span>
                  </>
                )}
              </motion.button>

              <p className="text-xs text-center text-[#6B7264] mt-6">
                {mode === "signin" ? (
                  <>
                    New here?{" "}
                    <button onClick={() => switchMode("signup")} className="text-[#4C7A2E] font-medium hover:underline">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already scanning with us?{" "}
                    <button onClick={() => switchMode("signin")} className="text-[#4C7A2E] font-medium hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}