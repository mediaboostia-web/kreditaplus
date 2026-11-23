import React, { useState } from "react";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpWithEmail(name, email, password);
        if (!res.success) {
          setError(res.error || "Échec de l'inscription");
          return;
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setError(res.error || "Échec de la connexion");
          return;
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAF9]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/kredita-logo.png"
            alt="Kredita"
            className="h-10 mx-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="text-2xl font-black text-[#0F2327]">Kredita</h1>
          <p className="text-sm text-[#556B6F]">
            Le crédit en toute confiance pour les petits commerces.
          </p>
        </div>

        <Card className="bg-white shadow-sm border-[#D9E3DF]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-[#0F2327]">
              {isSignUp ? "Créer votre compte commerçant" : "Connexion commerçant"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isSignUp
                ? "Inscrivez-vous pour sécuriser le suivi de vos crédits clients."
                : "Accédez à vos fiches clients et suivez vos remboursements."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Votre nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Amadou Diallo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Adresse email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="commercant@kredita.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-xs font-semibold">
                  Mot de passe
                </Label>
                <Input
                  id="pass"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0CA770] hover:bg-[#0a8f60] text-white font-semibold h-11"
              >
                {isLoading
                  ? "Chargement..."
                  : isSignUp
                  ? "Créer mon compte"
                  : "Se connecter"}
              </Button>
            </form>

            {/* Social OAuth Option (Prepared) */}
            <div className="mt-5 pt-4 border-t border-[#D9E3DF]">
              <Button
                type="button"
                variant="outline"
                onClick={() => signInWithOAuth("google")}
                className="w-full text-xs h-10 border-[#D9E3DF] text-[#0F2327]"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continuer avec Google (OAuth)
              </Button>
            </div>

            {/* Switch Sign in / Sign up */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-xs text-[#0CA770] hover:underline font-semibold"
              >
                {isSignUp
                  ? "Vous avez déjà un compte ? Connectez-vous"
                  : "Nouveau sur Kredita ? Créez un compte gratuitement"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-[11px] text-[#556B6F] flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0CA770]" />
          <span>Données chiffrées • Isolation stricte par commerce</span>
        </div>
      </div>
    </div>
  );
}
