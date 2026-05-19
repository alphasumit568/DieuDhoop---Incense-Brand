import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import toast from "react-hot-toast";
import { auth, googleProvider } from "../lib/firebase";
import { User } from "../types";
import { 
  signInWithPopup, 
  signInAnonymously as firebaseSignInAnonymously 
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  registerWithEmail: (email: string, name: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateWishlist: (productId: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          wishlist: data.user.wishlist || [],
          avatar: data.user.avatar
        });
      } else if (res.status === 401) {
        // Try refresh token
        const refreshRes = await fetch("/api/auth/refresh-token", { method: "POST" });
        if (refreshRes.ok) {
          return refreshUser();
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      // Ensure Firebase Auth session for Firestore rules
      if (!auth.currentUser) {
        await firebaseSignInAnonymously(auth);
      }

      setUser(data.user);
      toast.success("Welcome back to your sacred space!");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      setUser(data.user);
      toast.success("Signed in with Google successfully!");
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        return; // User closed the popup, don't show an error
      }
      if (error.code === "auth/popup-blocked") {
        toast.error("Portal blocked by browser. Please allow popups for divine entry.");
        return;
      }
      console.error(error);
      toast.error(error.message || "Google Authentication failed");
    }
  };

  const signInAnonymously = async () => {
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Guest login failed");

      setUser(data.user);
      toast.success("Welcome, anonymous traveler!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const registerWithEmail = async (email: string, name: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Ensure Firebase Auth session for Firestore rules
      if (!auth.currentUser) {
        await firebaseSignInAnonymously(auth);
      }

      setUser(data.user);
      toast.success("Divine vessel created successfully!");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      
      if (auth.currentUser) {
        await auth.signOut();
      }

      setUser(null);
      localStorage.removeItem("dieudhoop_cart");
      toast.success("Logged out successfully");
    } catch (err) {
      setUser(null);
    }
  };

  const updateWishlist = async (productId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, wishlist: data.wishlist } : null);
      }
    } catch (err) {
      console.error("Wishlist update failed");
    }
  };

  const updateProfile = async (updateData: { name?: string; email?: string; avatar?: string }) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUser(data.user);
      toast.success("Divine essence updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithEmail,
      signInWithGoogle,
      signInAnonymously,
      registerWithEmail,
      signOut, 
      refreshUser,
      updateWishlist,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
