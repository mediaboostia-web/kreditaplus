import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { lumailClient } from "@/lib/lumail";
import { useAuth } from "@/lib/auth-client";
import { Store, ArrowRight, ShieldCheck } from "lucide-react";

interface OnboardingProps {
  onComplete: (businessData: any) => Promise<void>;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();

  const [name, setName] = useState("Mon Commerce");
  const [ownerName, setOwnerName] = useState(user?.name || "");
  const [country, setCountry] = useState("Sénégal");
  const [city, setCity] = useState("Dakar");
  const [phone, setPhone] = useState("+221 ");
  const [currency, setCurrency] = useState("XOF");
  const [timezone, setTimezone] = useState("Africa/Dakar");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom de votre commerce est obligatoire.");
      return;
    }
    if (!ownerName.trim()) {
      setError("Le nom du gérant est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const decimals = ["XOF", "XAF", "GNF", "CDF"].includes(currency) ? 0 : 2;

      // Record marketing consent if explicitly opted-in
      if (newsletterOptIn && user?.email) {
        await lumailClient.updateSubscription(user.email, true, "onboarding_opt_in");
      }

      await onComplete({
        name: name.trim(),
        ownerName: ownerName.trim(),
        country: country.trim(),
        city: city.trim(),
        phone: phone.trim(),
        currency: currency.toUpperCase().trim(),
        currencyDecimals: decimals,
        language: "fr",
        timezone,
      });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAF9]">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <img
            src="/kredita-logo.png"
            alt="Kredita"
            className="h-10 mx-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="text-2xl font-black text-[#0F2327]">
            Bienvenue sur Kredita
          </h1>
          <p className="text-xs text-[#556B6F]">
            Configurez votre commerce pour démarrer le suivi de vos crédits.
          </p>
        </div>

        <Card className="bg-white border-[#D9E3DF]">
          <CardHeader className="pb-4 border-b border-[#D9E3DF]">
            <CardTitle className="text-base font-bold text-[#0F2327] flex items-center gap-2">
              <Store className="h-5 w-5 text-[#0CA770]" />
              Configuration du commerce
            </CardTitle>
            <CardDescription className="text-xs">
              Ces paramètres adaptent la devise et le format des relances clients.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bName" className="text-xs font-semibold">
                    Nom du commerce <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Épicerie Diallo, Boutique Moderne"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="oName" className="text-xs font-semibold">
                    Votre nom / gérant <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="oName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Amadou Diallo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-semibold">
                    Pays <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Sénégal, Côte d'Ivoire..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    Ville <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dakar, Abidjan..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    Téléphone du commerce <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-xs font-semibold">
                    Devise <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="XOF">XOF (FCFA UMOA)</option>
                    <option value="XAF">XAF (FCFA CEMAC)</option>
                    <option value="GNF">GNF (Franc Guinéen)</option>
                    <option value="CDF">CDF (Franc Congolais)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="USD">USD ($ Dollar US)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone" className="text-xs font-semibold">
                  Fuseau horaire
                </Label>
                <Select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                  <option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</option>
                  <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                  <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
                  <option value="Africa/Kinshasa">Africa/Kinshasa (GMT+1)</option>
                </Select>
              </div>

              {/* Explicit Lumail Newsletter Opt-in Checkbox */}
              <div className="rounded-lg border border-[#D9E3DF] p-3 bg-[#F8FAF9] space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0CA770] focus:ring-[#0CA770]"
                  />
                  <div className="text-xs text-[#0F2327]">
                    <span className="font-semibold block">
                      Recevoir les conseils et actualités Kredita (Lumail.io)
                    </span>
                    <span className="text-[11px] text-[#556B6F] block mt-0.5">
                      Conseils de gestion du crédit et retours de commerçants. Vous pouvez vous désabonner à tout moment dans vos paramètres.
                    </span>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0CA770] hover:bg-[#0a8f60] text-white font-semibold h-11"
              >
                {isSubmitting ? "Création en cours..." : "Démarrer avec mon commerce"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
