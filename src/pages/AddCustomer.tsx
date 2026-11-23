import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";

interface AddCustomerProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onSubmit: (data: { name: string; phone?: string; notes?: string }) => Promise<string>;
}

export function AddCustomer({ onNavigate, onSubmit }: AddCustomerProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom du client est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onNavigate("customers/detail", { id: newId });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création du client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("customers")}
        className="text-xs text-[#556B6F] hover:text-[#0F2327] -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Annuler
      </Button>

      <Card className="bg-white">
        <CardHeader className="border-b border-[#D9E3DF] pb-4">
          <CardTitle className="text-lg font-bold text-[#0F2327] flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#0CA770]" />
            Nouveau client
          </CardTitle>
          <p className="text-xs text-[#556B6F]">
            Créez la fiche client pour enregistrer ses achats à crédit et ses relances.
          </p>
        </CardHeader>

        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Nom complet du client <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Fatou Sow, Ibrahim Traoré"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Numéro de téléphone (avec indicatif pays)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ex: +221 77 123 45 67 ou +225 07 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-[11px] text-[#556B6F]">
                Indispensable pour préremplir la relance WhatsApp en un clic.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Note facultative (adresse, repère, relation)
              </Label>
              <Input
                id="notes"
                placeholder="Ex: Boutique du marché, cousin de Moussa"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-3 border-t border-[#D9E3DF] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onNavigate("customers")}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#0CA770] hover:bg-[#0a8f60] text-white font-semibold"
              >
                {isSubmitting ? "Enregistrement..." : "Créer le client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
