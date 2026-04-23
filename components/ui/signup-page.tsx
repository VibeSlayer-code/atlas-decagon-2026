"use client";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field-1";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import atlasLogo from "@/assets/Atlas Minimal Logo.svg";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { supabase } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
      fill="#4285F4"
    />
    <path
      d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
      fill="#34A853"
    />
    <path
      d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49L4.405 11.9z"
      fill="#FBBC05"
    />
    <path
      d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
      fill="#EA4335"
    />
  </svg>
);

const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, label: "", color: "" };
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  if (strength <= 2)
    return { strength: 33, label: "Weak", color: "bg-red-500" };
  if (strength <= 3)
    return { strength: 66, label: "Medium", color: "bg-yellow-500" };
  return { strength: 100, label: "Strong", color: "bg-green-500" };
};

interface SignupPageProps {
  onLoginClick?: () => void;
  onSignupSuccess?: () => void;
}

export default function SignupPage({
  onLoginClick,
  onSignupSuccess,
}: SignupPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  // Auto-hide toast after 8 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLoginClick) onLoginClick();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: "",
          bio: "",
          phone: "",
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Insert into profiles table if the user was created
      if (data.user) {
        try {
          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              avatar_url: "",
              bio: "",
              phone: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          );
        } catch {
          // profiles table may not exist yet — that's okay
        }
      }
      setShowToast(true);
      if (onSignupSuccess) onSignupSuccess();
    }
    setIsLoading(false);
  };


  return (
    <div
      ref={ref}
      id="signup-section"
      className="grid min-h-svh bg-background lg:grid-cols-2 relative overflow-hidden"
    >
      {/* SUCCESS TOAST (BOTTOM RIGHT) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-sm bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-xl p-5 flex gap-4 items-start"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Verify your email
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                A link was sent to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Please verify to continue.
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 p-6 md:p-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
          }
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center md:justify-start"
        >
          <div className="flex items-center">
            <img
              src={atlasLogo}
              alt="Atlas Logo"
              height={40}
              width={40}
              className="h-10 w-10 object-contain"
            />
          </div>
        </motion.div>

        <div className="flex flex-1 w-full items-center justify-center">
          <div className="w-full max-w-md">
            <form className="flex flex-col gap-6" onSubmit={handleSignup}>
              <FieldGroup>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col items-start gap-2.5 text-left mb-10"
                >
                  <h1 className="text-5xl font-semibold tracking-tight leading-[1.1]">
                    Start Your Journey
                  </h1>
                  <p className="text-muted-foreground font-normal text-base">
                    Enter your details
                  </p>
                </motion.div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-md">
                    {errorMsg}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-6"
                >
                  <Field>
                    <FieldLabel
                      htmlFor="name"
                      className="text-sm font-medium mb-2"
                    >
                      Full Name
                    </FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 rounded-md border-border bg-background/80 shadow-sm focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    />
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="text-sm font-medium mb-2"
                    >
                      Email Address
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-md border-border bg-background/80 shadow-sm focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    />
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-medium mb-2"
                    >
                      Password
                    </FieldLabel>
                    <Input
                      id="password"
                      placeholder="Create a password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-md border-border bg-background/80 shadow-sm focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    />
                    <AnimatePresence>
                      {password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 space-y-1.5 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                animate={{
                                  width: `${passwordStrength.strength}%`,
                                }}
                                className={`h-full ${passwordStrength.color}`}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground min-w-[60px]">
                              {passwordStrength.label}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-md shadow-sm font-semibold text-sm bg-primary hover:bg-primary/90 text-white transition-all mt-4"
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Field>
                  <FieldSeparator>Or continue with</FieldSeparator>
                  <Field>
                    <Button
                      className="flex items-center justify-center gap-3 w-full h-12 rounded-md bg-background border border-border text-foreground hover:bg-muted/50 hover:border-border/80 shadow-sm font-medium text-sm transition-all"
                      type="button"
                    >
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </Button>
                    <FieldDescription className="text-center w-full mt-8 flex items-center justify-center text-sm">
                      Already have an account?{" "}
                      <a
                        href="#"
                        onClick={handleLoginClick}
                        className="underline underline-offset-4 ml-1.5 font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        Log in
                      </a>
                    </FieldDescription>
                  </Field>
                </motion.div>
              </FieldGroup>
            </form>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="bg-muted relative hidden lg:block overflow-hidden"
      >
        <GradientMesh
          colors={["#3A0CA3", "#560BAD", "#7209B7"]}
          distortion={8}
          swirl={0.2}
          speed={1}
          rotation={90}
          waveAmp={0.2}
          waveFreq={20}
          waveSpeed={0.2}
          grain={0.06}
        />
      </motion.div>
    </div>
  );
}
