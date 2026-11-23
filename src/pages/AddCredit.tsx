import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CustomerItem } from "./CustomersList";

interface AddCreditProps {
  business: {
    currency: string;
    currencyDecimals: number;
  };
  customers: CustomerItem[];
  preselectedCustomerId?: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onSubmit: (data: {
    customerId: string;
    amount: number;
    date: string;
    dueDate?: string;
    description?: string;
    idempotencyKey?: string;
  }) => Promise<string>;
}

export function AddCredit({
  business,
  customers,
  preselectedCustomerId,
  onNavigate,
  onSubmit,
}: AddCreditProps) {
  const [customerId, setCustomerId] = useState(preselectedCustomerId || customers[0]?.id || "");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError("Veuillez sélectionner un client.");
      return;
    }

    const rawNum = parseFloat(amountStr);
    if (isNaN(rawNum) || rawNum <= 0) {
      setError("Le montant doit être supérieur à zéro.");
      return;
    }

    // Convert to minor currency integer
    const minorUnits = business.currencyDecimals === 0
      ? Math.round(rawNum)
      : Math.round(rawNum * Math.pow(10, business.currencyDecimals));

    if (minorUnits <= 0) {
      setError("Le montant doit être strictement positif.");
      return;
    }

    const idempotencyKey = `credit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    setIsSubmitting(true);
    try {
      await onSubmit({
        customerId,
        amount: minorUnits,
        date,
        dueDate: dueDate || undefined,
        description: description.trim() || undefined,
        idempotencyKey,
      });
      onNavigate("customers/detail", { id: customerId });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement du crédit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-20 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (preselectedCustomerId) {
            onNavigate("customers/detail", { id: preselectedCustomerId });
          } else {
            onNavigate("dashboard");
          }
        }}
        className="text-xs text-[#556B6F] hover:text-[#0F2327] -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Annuler
      </Button>

      <Card className="bg-white">
        <CardHeader className="border-b border-[#D9E3DF] pb-4">
          <CardTitle className="text-lg font-bold text-[#0F2327] flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-red-600" />
            Enregistrer un achat à crédit
          </CardTitle>
          <p className="text-xs text-[#556B6F]">
            Ajoute une dette sur la fiche du client sélectionné.
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
              <Label htmlFor="customer" className="text-xs font-semibold">
                Client concerné <span className="text-red-500">*</span>
              </Label>
              <Select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choisissez un client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold">
                Montant ({business.currency}) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step={business.currencyDecimals === 0 ? "1" : "0.01"}
                placeholder="Ex: 5000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-semibold">
                  Date de l'opération <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dueDate" className="text-xs font-semibold">
                  Date d'échéance (facultative)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Description ou articles (facultatif)
              </Label>
              <Input
                id="description"
                placeholder="Ex: Sac de riz 50kg, Huile 5L"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-3 border-t border-[#D9E3DF] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onNavigate("dashboard")}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#0CA770] hover:bg-[#0a8f60] text-white font-semibold"
              >
                {isSubmitting ? "Enregistrement..." : "Valider le crédit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
