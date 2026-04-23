// src/App.tsx
import { useState, useEffect } from "react";
import LoginPage from "../components/ui/login-page";
import SignupPage from "../components/ui/signup-page";
import DashboardPage from "../components/dashboard"; // IMPORT YOUR DASHBOARD
import { supabase } from "../lib/supabase";
import { UserProvider } from "../lib/user-context";

function App() {
  const [view, setView] = useState<"login" | "signup">("signup");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, etc)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while we check if the user is logged in
  if (loading) return null;

  // --- NAVIGATION LOGIC ---

  // 1. If user is logged in, show the REAL Dashboard
  if (session) {
    return (
      <UserProvider>
        <DashboardPage />
      </UserProvider>
    );
  }

  // 2. If NOT logged in, show Login or Signup
  return (
    <div className="App">
      {view === "signup" ? (
        <SignupPage onLoginClick={() => setView("login")} />
      ) : (
        <LoginPage onSignupClick={() => setView("signup")} />
      )}
    </div>
  );
}

export default App;
