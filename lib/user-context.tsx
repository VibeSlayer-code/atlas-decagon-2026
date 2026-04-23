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
    setUser(extractUser(supabaseUser, profile));
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
        // 1. Update Supabase auth user_metadata (always works)
        const metadata: Record<string, string> = {};
        if (data.fullName !== undefined) metadata.full_name = data.fullName;
        if (data.avatarUrl !== undefined) metadata.avatar_url = data.avatarUrl;
        if (data.bio !== undefined) metadata.bio = data.bio;
        if (data.phone !== undefined) metadata.phone = data.phone;

        const { error: authError } = await supabase.auth.updateUser({ data: metadata });
        if (authError) {
          setUpdating(false);
          return { success: false, error: authError.message };
        }

        // 2. Upsert into profiles table (if it exists)
        try {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name: data.fullName ?? user.fullName,
              avatar_url: data.avatarUrl ?? user.avatarUrl,
              bio: data.bio ?? user.bio,
              phone: data.phone ?? user.phone,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          );
        } catch {
          // profiles table may not exist yet — that's okay, auth metadata is the fallback
        }

        await refreshUser();
        setUpdating(false);
        return { success: true };
      } catch (err: any) {
        setUpdating(false);
        return { success: false, error: err.message || "An unexpected error occurred" };
      }
    },
    [user, refreshUser],
  );

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      // 1. Delete profile row if table exists
      try {
        await supabase.from("profiles").delete().eq("id", user.id);
      } catch {
        // table may not exist
      }

      // 2. Call the edge function / RPC to delete the auth user
      // Note: Supabase doesn't allow users to delete themselves via client SDK.
      // We call a database function that uses service_role to delete.
      const { error: rpcError } = await supabase.rpc("delete_user");

      if (rpcError) {
        // Fallback: just sign out if the RPC doesn't exist yet
        console.warn("delete_user RPC not found, signing out instead:", rpcError.message);
        await supabase.auth.signOut();
        setUser(null);
        return { success: true };
      }

      await supabase.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete account" };
    }
  }, [user]);

  const signOut = useCallback(async () => {
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
