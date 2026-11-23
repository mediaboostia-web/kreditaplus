import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { lumailClient } from "@/lib/lumail";
import { useAuth } from "@/lib/auth-client";
import {
  Store,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Clock,
  Shield,
} from "lucide-react";

interface BusinessProfile {
  name: string;
  ownerName: string;
  country: string;
  city: string;
  phone: string;
  currency: string;
  currencyDecimals: number;
  language: string;
  timezone: string;
  createdAt?: number;
  updatedAt?: number;
}

interface SettingsProps {
  business: BusinessProfile;
  onUpdateBusiness: (data: Partial<BusinessProfile>) => Promise<void>;
  onNavigate: (route: string) => void;
}

export function Settings({ business, onUpdateBusiness, onNavigate }: SettingsProps) {
  const { user } = useAuth();

  // Business state
  const [name, setName] = useState(business.name);
  const [ownerName, setOwnerName] = useState(business.ownerName);
  const [country, setCountry] = useState(business.country);
  const [city, setCity] = useState(business.city);
  const [phone, setPhone] = useState(business.phone);
  const [currency, setCurrency] = useState(business.currency);
  const [timezone, setTimezone] = useState(business.timezone);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lumail consent state
  const userEmail = user?.email || "commercant@kredita.app";
  const existingConsent = lumailClient.getStoredConsent(userEmail);
  const [isSubscribed, setIsSubscribed] = useState(
    existingConsent ? existingConsent.status === "subscribed" : false
  );
  const [lumailMessage, setLumailMessage] = useState<string | null>(null);
  const [isUpdatingLumail, setIsUpdatingLumail] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      const decimals = ["XOF", "XAF", "GNF", "CDF"].includes(currency) ? 0 : 2;
      await onUpdateBusiness({
        name: name.trim(),
        ownerName: ownerName.trim(),
        country: country.trim(),
        city: city.trim(),
        phone: phone.trim(),
        currency: currency.toUpperCase().trim(),
        currencyDecimals: decimals,
        timezone,
      });
      setSuccessMsg("Profil du commerce mis à jour avec succès.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLumailSubscription = async (subscribe: boolean) => {
    setIsUpdatingLumail(true);
    try {
      const result = await lumailClient.updateSubscription(
        userEmail,
        subscribe,
        "settings_preferences"
      );
      setIsSubscribed(subscribe);
      setLumailMessage(result.message);
      setTimeout(() => setLumailMessage(null), 6000);
    } finally {
      setIsUpdatingLumail(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 pt-2">
      <div>
        <h1 className="text-xl font-bold text-[#0F2327]">Paramètres du commerce</h1>
        <p className="text-xs text-[#556B6F]">
          Configuration générale, devise de travail et préférences de communication
        </p>
      </div>

      {successMsg && (
        <div className="rounded-md bg-[#B4F5D8]/40 border border-[#0CA770]/40 p-3 text-xs text-[#0F2327] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#0CA770]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Business Details Form */}
      <Card className="bg-white">
        <CardHeader className="border-b border-[#D9E3DF] pb-4">
          <CardTitle className="text-base font-bold text-[#0F2327] flex items-center gap-2">
            <Store className="h-4 w-4 text-[#0CA770]" />
            Identité du commerce
          </CardTitle>
          <CardDescription className="text-xs">
            Ces informations sont utilisées pour l'entête des relances WhatsApp et le suivi comptable.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bizName" className="text-xs font-semibold">
                  Nom du commerce
                </Label>
                <Input
                  id="bizName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="owner" className="text-xs font-semibold">
                  Nom du gérant / propriétaire
                </Label>
                <Input
                  id="owner"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-semibold">
                  Pays
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ex: Sénégal, Côte d'Ivoire, Cameroun"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold">
                  Ville
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Dakar, Abidjan, Douala"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Téléphone du commerce (indicatif international)
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +221 77 000 00 00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs font-semibold">
                  Devise principale
                </Label>
                <Select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="XOF">XOF (Franc CFA UMOA - Sénégal, Côte d'Ivoire...)</option>
                  <option value="XAF">XAF (Franc CFA CEMAC - Cameroun, Gabon...)</option>
                  <option value="GNF">GNF (Franc Guinéen)</option>
                  <option value="CDF">CDF (Franc Congolais)</option>
                  <option value="MAD">MAD (Dirham Marocain)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ Dollar US)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option value="Africa/Lubumbashi">Africa/Lubumbashi (GMT+2)</option>
                  <option value="Europe/Paris">Europe/Paris (GMT+1 / GMT+2)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-400">
                  Langue de l'interface
                </Label>
                <Input value="Français (fr)" disabled className="bg-gray-50 text-gray-500" />
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9E3DF] flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-[#0CA770] hover:bg-[#0a8f60] text-white font-semibold"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lumail.io Email Marketing & Communications Section */}
      <Card className="bg-white">
        <CardHeader className="border-b border-[#D9E3DF] pb-4">
          <CardTitle className="text-base font-bold text-[#0F2327] flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#0CA770]" />
            Préférences de communication (Lumail.io)
          </CardTitle>
          <CardDescription className="text-xs">
            Conformité stricte : nous ne vous inscrivons à aucune liste marketing sans votre accord explicite.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {lumailMessage && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
              {lumailMessage}
            </div>
          )}

          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-[#D9E3DF] bg-[#F8FAF9]">
            <div className="space-y-1">
              <span className="text-sm font-bold text-[#0F2327] block">
                Newsletter et conseils pour petits commerces
              </span>
              <p className="text-xs text-[#556B6F]">
                Recevez nos guides de gestion du crédit client, alertes de nouvelles fonctionnalités et retours d'expérience de commerçants.
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#556B6F]">
                <Shield className="h-3 w-3 text-[#0CA770]" />
                <span>Adresse enregistrée : {userEmail}</span>
              </div>
            </div>

            <Button
              type="button"
              variant={isSubscribed ? "outline" : "default"}
              size="sm"
              disabled={isUpdatingLumail}
              onClick={() => handleToggleLumailSubscription(!isSubscribed)}
              className={
                isSubscribed
                  ? "border-red-200 text-red-700 hover:bg-red-50 text-xs shrink-0"
                  : "bg-[#0CA770] hover:bg-[#0a8f60] text-white text-xs shrink-0"
              }
            >
              {isUpdatingLumail
                ? "Mise à jour..."
                : isSubscribed
                ? "Se désabonner"
                : "S'inscrire (Opt-in)"}
            </Button>
          </div>

          <div className="rounded-md bg-[#EEF3F1] p-3 text-[11px] text-[#556B6F] space-y-1">
            <p className="font-semibold text-[#0F2327]">Séparation stricte des emails :</p>
            <p>
              Les emails d'authentification et de sécurité sont strictement distincts des communications marketing Lumail.io. Vous pouvez vous désabonner à tout moment d'un simple clic.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
