import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: "google") => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = "kredita_auth_session";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      } else {
        // Default demo merchant for seamless initial onboarding experience
        const defaultMerchant: Session = {
          user: {
            id: "user_kredita_owner_1",
            name: "Amadou Diallo",
            email: "amadou@kredita.app",
          },
          token: "demo_token_kredita",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };
        setSession(defaultMerchant);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMerchant));
      }
    } catch {
      // storage unavailable
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!email.includes("@")) {
        return { success: false, error: "Veuillez entrer une adresse email valide." };
      }
      const newSession: Session = {
        user: {
          id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
          name: email.split("@")[0],
          email,
        },
        token: `token_${Date.now()}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      setSession(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      return { success: true };
    } catch {
      return { success: false, error: "Échec de connexion." };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!name.trim()) {
        return { success: false, error: "Le nom est obligatoire." };
      }
      if (!email.includes("@")) {
        return { success: false, error: "Veuillez entrer une adresse email valide." };
      }
      const newSession: Session = {
        user: {
          id: `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
          name: name.trim(),
          email: email.trim(),
        },
        token: `token_${Date.now()}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      setSession(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      return { success: true };
    } catch {
      return { success: false, error: "Échec de l'inscription." };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider: "google") => {
    // If OAuth keys are not configured in environment, show clear message
    const hasGoogleOauth = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
    if (!hasGoogleOauth) {
      alert("Authentification Google OAuth : VITE_GOOGLE_CLIENT_ID n'est pas configuré dans les variables d'environnement. Utilisez la connexion par email.");
      return;
    }
    // Redirect to OAuth provider
    window.location.href = `/api/auth/signin/${provider}`;
  };

  const signOut = async () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
