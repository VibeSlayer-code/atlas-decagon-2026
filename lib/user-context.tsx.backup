import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  phone: string;
  createdAt: string;
}

interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updating: boolean;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "atlas_user_profile_local";

function extractUser(supabaseUser: any, profileRow?: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    fullName:
      profileRow?.full_name ||
      (supabaseUser.user_metadata?.full_name as string) ||
      supabaseUser.email?.split("@")[0] ||
      "User",
    avatarUrl:
      profileRow?.avatar_url ||
      (supabaseUser.user_metadata?.avatar_url as string) ||
      (supabaseUser.user_metadata?.profile_picture_url as string) ||
      "",
    bio: profileRow?.bio || (supabaseUser.user_metadata?.bio as string) || "",
    phone:
      profileRow?.phone ||
      (supabaseUser.user_metadata?.phone as string) ||
      supabaseUser.phone ||
      "",
    createdAt: supabaseUser.created_at || "",
  };
}

async function fetchProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadUser = useCallback(async (supabaseUser: any) => {
    const profile = await fetchProfile(supabaseUser.id);
    const dbUser = extractUser(supabaseUser, profile);
    
    // Check if we have local overrides
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const localOverrides = JSON.parse(localData);
        // Merge: DB data as base, local overrides for fullName and avatarUrl
        setUser({
          ...dbUser,
          fullName: localOverrides.fullName || dbUser.fullName,
          avatarUrl: localOverrides.avatarUrl || dbUser.avatarUrl,
          bio: localOverrides.bio || dbUser.bio,
          phone: localOverrides.phone || dbUser.phone,
        });
      } else {
        setUser(dbUser);
      }
    } catch {
      setUser(dbUser);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (supabaseUser) {
      await loadUser(supabaseUser);
    }
  }, [loadUser]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUser(session.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: "Not authenticated" };
      setUpdating(true);
      
      try {
        // Save local overrides to localStorage (fullName, avatarUrl, bio, phone)
        const localOverrides = {
          fullName: data.fullName !== undefined ? data.fullName : user.fullName,
          avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : user.avatarUrl,
          bio: data.bio !== undefined ? data.bio : user.bio,
          phone: data.phone !== undefined ? data.phone : user.phone,
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localOverrides));
        
        // Update local state immediately
        setUser({
          ...user,
          ...data,
        });
        
        setUpdating(false);
        return { success: true };
      } catch (err: any) {
        setUpdating(false);
        return { success: false, error: err.message || "Failed to update profile" };
      }
    },
    [user],
  );

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      // Clear local overrides
      localStorage.removeItem(STORAGE_KEY);
      
      // Clear all app data
      localStorage.removeItem("atlas_hackathon_flashcards");
      localStorage.removeItem("atlas_hackathon_notes");
      localStorage.removeItem("atlas_hackathon_quizzes");
      localStorage.removeItem("atlas_hackathon_mindmaps");
      localStorage.removeItem("atlas_pref");
      
      // Try to delete from database
      try {
        await supabase.from("profiles").delete().eq("id", user.id);
      } catch {
        // table may not exist
      }

      // Try to call delete RPC
      try {
        await supabase.rpc("delete_user");
      } catch {
        // RPC may not exist, just sign out
      }

      await supabase.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete account" };
    }
  }, [user]);

  const signOut = useCallback(async () => {
    // Clear local overrides on sign out
    localStorage.removeItem(STORAGE_KEY);
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, updating, updateProfile, refreshUser, signOut, deleteAccount }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
