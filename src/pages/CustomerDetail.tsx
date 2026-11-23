import React, { useState } from "react";
import { formatCurrency, formatDate, getStatusDetails } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  Calendar,
  FileText,
  Plus,
  Archive,
  ArchiveRestore,
  Edit,
  CheckCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "credit" | "payment";
  amount: number;
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  description?: string;
  reference?: string;
}

interface CustomerDetailProps {
  business: {
    name: string;
    currency: string;
    currencyDecimals: number;
  };
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    notes?: string | null;
    isArchived: boolean;
    totalCredits: number;
    totalPayments: number;
    outstandingBalance: number;
    status: "settled" | "overdue" | "due_soon" | "up_to_date";
    transactions: Transaction[];
  };
  onNavigate: (route: string, params?: Record<string, string>) => void;
  onToggleArchive: (customerId: string, newArchivedState: boolean) => Promise<void>;
}

export function CustomerDetail({
  business,
  customer,
  onNavigate,
  onToggleArchive,
}: CustomerDetailProps) {
  const { currency, currencyDecimals } = business;
  const statusInfo = getStatusDetails(customer.status);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchiveToggle = async () => {
    setIsArchiving(true);
    try {
      await onToggleArchive(customer.id, !customer.isArchived);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 pt-2">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("customers")}
          className="text-xs text-[#556B6F] hover:text-[#0F2327] -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux clients
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchiveToggle}
            disabled={isArchiving}
            className="text-xs text-[#556B6F] h-9"
          >
            {customer.isArchived ? (
              <>
                <ArchiveRestore className="h-3.5 w-3.5 mr-1 text-[#0CA770]" />
                Désarchiver
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5 mr-1" />
                Archiver
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("customers/edit", { id: customer.id })}
            className="text-xs h-9"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Customer Header Card */}
      <Card className="bg-white p-5 border-[#D9E3DF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#0F2327]">{customer.name}</h1>
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
              {customer.isArchived && (
                <Badge variant="outline" className="text-gray-500">
                  Client archivé
                </Badge>
              )}
            </div>

            {customer.phone ? (
              <div className="flex items-center text-sm text-[#556B6F]">
                <Phone className="h-4 w-4 mr-1.5 text-[#0CA770]" />
                <span>{customer.phone}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Aucun numéro de téléphone enregistré (la relance WhatsApp nécessite un numéro).
              </p>
            )}

            {customer.notes && (
              <div className="flex items-start text-xs text-[#556B6F] mt-1">
                <FileText className="h-3.5 w-3.5 mr-1.5 shrink-0 mt-0.5 text-gray-400" />
                <span>{customer.notes}</span>
              </div>
            )}
          </div>

          {/* Outstanding Balance Highlight Box */}
          <div className="rounded-xl bg-[#F8FAF9] border border-[#D9E3DF] p-4 text-right sm:min-w-[180px]">
            <span className="text-xs font-semibold text-[#556B6F] block uppercase tracking-wider">
              Solde restant à payer
            </span>
            <span
              className={`text-2xl font-black mt-1 block ${
                customer.outstandingBalance > 0 ? "text-red-600" : "text-[#0CA770]"
              }`}
            >
              {formatCurrency(customer.outstandingBalance, currency, currencyDecimals)}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-5 pt-4 border-t border-[#D9E3DF] flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => onNavigate("credits/new", { customerId: customer.id })}
            className="bg-[#0F2327] hover:bg-[#1b3d43] text-white text-xs font-semibold h-10"
          >
            <Plus className="h-4 w-4 mr-1 text-[#B4F5D8]" />
            Nouveau crédit
          </Button>

          {customer.outstandingBalance > 0 && (
            <Button
              size="sm"
              onClick={() => onNavigate("payments/new", { customerId: customer.id })}
              className="bg-[#0CA770] hover:bg-[#099262] text-white text-xs font-semibold h-10"
            >
              <ArrowDownLeft className="h-4 w-4 mr-1" />
              Enregistrer remboursement
            </Button>
          )}

          {customer.outstandingBalance > 0 && customer.phone && (
            <WhatsAppButton
              customerName={customer.name}
              customerPhone={customer.phone}
              businessName={business.name}
              amountDueFormatted={formatCurrency(
                customer.outstandingBalance,
                currency,
                currencyDecimals
              )}
              className="h-10 text-xs"
            />
          )}
        </div>
      </Card>

      {/* Financial Summary Figures */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white border border-[#D9E3DF] p-3 text-center">
          <span className="text-[11px] text-[#556B6F] block">Total crédits accordés</span>
          <span className="text-base font-bold text-[#0F2327]">
            {formatCurrency(customer.totalCredits, currency, currencyDecimals)}
          </span>
        </div>

        <div className="rounded-lg bg-white border border-[#D9E3DF] p-3 text-center">
          <span className="text-[11px] text-[#556B6F] block">Total déjà remboursé</span>
          <span className="text-base font-bold text-[#0CA770]">
            {formatCurrency(customer.totalPayments, currency, currencyDecimals)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-lg bg-white border border-[#D9E3DF] p-3 text-center">
          <span className="text-[11px] text-[#556B6F] block">Nombre d'opérations</span>
          <span className="text-base font-bold text-[#0F2327]">
            {customer.transactions.length}
          </span>
        </div>
      </div>

      {/* Transaction History Section */}
      <Card>
        <CardHeader className="border-b border-[#D9E3DF] pb-3">
          <CardTitle className="text-base font-bold text-[#0F2327]">
            Historique chronologique des opérations
          </CardTitle>
          <p className="text-xs text-[#556B6F]">
            Tous les crédits et remboursements sont conservés sans modification
          </p>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-[#D9E3DF]">
          {customer.transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#556B6F]">
              Aucune opération enregistrée pour ce client.
            </div>
          ) : (
            customer.transactions.map((tx) => {
              const isCredit = tx.type === "credit";
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isCredit
                          ? "bg-red-50 text-red-600"
                          : "bg-[#0CA770]/10 text-[#0CA770]"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#0F2327]">
                        {isCredit ? "Crédit accordé" : "Remboursement reçu"}
                      </div>
                      <div className="text-xs text-[#556B6F] flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(tx.date)}
                        </span>
                        {isCredit && tx.dueDate && (
                          <span className="text-amber-800 bg-amber-50 rounded px-1.5 py-0.2">
                            Échéance : {formatDate(tx.dueDate)}
                          </span>
                        )}
                        {!isCredit && tx.paymentMethod && (
                          <span className="bg-gray-100 rounded px-1.5 py-0.2 text-gray-700">
                            {tx.paymentMethod === "mobile_money"
                              ? "Mobile Money"
                              : tx.paymentMethod === "cash"
                              ? "Espèces"
                              : tx.paymentMethod}
                          </span>
                        )}
                        {tx.description && (
                          <span className="text-gray-500">• {tx.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-bold ${
                        isCredit ? "text-red-600" : "text-[#0CA770]"
                      }`}
                    >
                      {isCredit ? "+" : "-"}{" "}
                      {formatCurrency(tx.amount, currency, currencyDecimals)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
