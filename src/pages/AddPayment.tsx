import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowDownLeft, AlertCircle } from "lucide-react";
import { CustomerItem } from "./CustomersList";

interface AddPaymentProps {
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
    paymentMethod: "cash" | "mobile_money" | "transfer" | "other";
    reference?: string;
    description?: string;
    idempotencyKey?: string;
  }) => Promise<string>;
}

export function AddPayment({
  business,
  customers,
  preselectedCustomerId,
  onNavigate,
  onSubmit,
}: AddPaymentProps) {
  // Only show customers who actually have a due balance
  const eligibleCustomers = customers.filter((c) => c.outstandingBalance > 0);

  const [customerId, setCustomerId] = useState(
    preselectedCustomerId || eligibleCustomers[0]?.id || ""
  );
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "mobile_money" | "transfer" | "other"
  >("cash");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const maxOutstanding = selectedCustomer ? selectedCustomer.outstandingBalance : 0;

  // Quick preset: pay all
  const handlePayFullBalance = () => {
    if (!selectedCustomer) return;
    const major =
      business.currencyDecimals === 0
        ? selectedCustomer.outstandingBalance
        : selectedCustomer.outstandingBalance / Math.pow(10, business.currencyDecimals);
    setAmountStr(major.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError("Veuillez sélectionner un client.");
      return;
    }

    if (!selectedCustomer) {
      setError("Client introuvable.");
      return;
    }

    const rawNum = parseFloat(amountStr);
    if (isNaN(rawNum) || rawNum <= 0) {
      setError("Le montant doit être supérieur à zéro.");
      return;
    }

    // Convert to minor currency integer
    const minorUnits =
      business.currencyDecimals === 0
        ? Math.round(rawNum)
        : Math.round(rawNum * Math.pow(10, business.currencyDecimals));

    if (minorUnits <= 0) {
      setError("Le montant doit être strictement positif.");
      return;
    }

    if (minorUnits > selectedCustomer.outstandingBalance) {
      setError(
        `Le remboursement ne peut pas dépasser le solde restant (${formatCurrency(
          selectedCustomer.outstandingBalance,
          business.currency,
          business.currencyDecimals
        )}).`
      );
      return;
    }

    const idempotencyKey = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    setIsSubmitting(true);
    try {
      await onSubmit({
        customerId,
        amount: minorUnits,
        date,
        paymentMethod,
        reference: reference.trim() || undefined,
        description: description.trim() || undefined,
        idempotencyKey,
      });
      onNavigate("customers/detail", { id: customerId });
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement du remboursement.");
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
            <ArrowDownLeft className="h-5 w-5 text-[#0CA770]" />
            Enregistrer un remboursement
          </CardTitle>
          <p className="text-xs text-[#556B6F]">
            Les remboursements partiels sont autorisés. Le montant ne peut pas excéder le solde restant dû.
          </p>
        </CardHeader>

        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="customer" className="text-xs font-semibold">
                Client qui rembourse <span className="text-red-500">*</span>
              </Label>
              <Select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Sélectionnez le client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Reste dû :{" "}
                    {formatCurrency(
                      c.outstandingBalance,
                      business.currency,
                      business.currencyDecimals
                    )}
                  </option>
                ))}
              </Select>
            </div>

            {/* Current outstanding indicator & full payoff button */}
            {selectedCustomer && (
              <div className="rounded-lg bg-[#B4F5D8]/20 border border-[#0CA770]/30 p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#556B6F] block">
                    Solde actuellement dû par {selectedCustomer.name} :
                  </span>
                  <span className="text-base font-black text-[#0F2327]">
                    {formatCurrency(
                      selectedCustomer.outstandingBalance,
                      business.currency,
                      business.currencyDecimals
                    )}
                  </span>
                </div>
                {selectedCustomer.outstandingBalance > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePayFullBalance}
                    className="h-8 text-xs bg-white text-[#0CA770] border-[#0CA770]/40 font-semibold hover:bg-[#B4F5D8]/30"
                  >
                    Tout solder
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold">
                Montant reçu ({business.currency}) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step={business.currencyDecimals === 0 ? "1" : "0.01"}
                placeholder="Ex: 2500"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-semibold">
                  Date de réception <span className="text-red-500">*</span>
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
                <Label htmlFor="method" className="text-xs font-semibold">
                  Moyen de paiement
                </Label>
                <Select
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="cash">Espèces</option>
                  <option value="mobile_money">Mobile Money (Wave, Orange, etc.)</option>
                  <option value="transfer">Virement bancaire</option>
                  <option value="other">Autre moyen</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference" className="text-xs font-semibold">
                Référence ou numéro de transaction (facultatif)
              </Label>
              <Input
                id="reference"
                placeholder="Ex: Ref Wave OM1294827"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Note facultative
              </Label>
              <Input
                id="description"
                placeholder="Ex: Acompte sur le sac de riz"
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
                {isSubmitting ? "Enregistrement..." : "Valider le remboursement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
