import React, { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Calendar, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TransactionItem {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  type: "credit" | "payment";
  amount: number;
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  reference?: string;
  description?: string;
}

interface ActivityProps {
  business: {
    name: string;
    currency: string;
    currencyDecimals: number;
  };
  transactions: TransactionItem[];
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function Activity({ business, transactions, onNavigate }: ActivityProps) {
  const { currency, currencyDecimals } = business;
  const [filter, setFilter] = useState<"all" | "credit" | "payment">("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchCust = tx.customerName.toLowerCase().includes(term);
      const matchDesc = tx.description?.toLowerCase().includes(term);
      const matchRef = tx.reference?.toLowerCase().includes(term);
      if (!matchCust && !matchDesc && !matchRef) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 pt-2">
      <div>
        <h1 className="text-xl font-bold text-[#0F2327]">Journal d'activité</h1>
        <p className="text-xs text-[#556B6F]">
          Historique exhaustif et immuable de toutes les opérations du commerce
        </p>
      </div>

      {/* Filter and Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#556B6F]" />
          <Input
            placeholder="Rechercher par client, description, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: "all", label: "Toutes les opérations" },
            { id: "credit", label: "Crédits accordés" },
            { id: "payment", label: "Remboursements perçus" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === tab.id
                  ? "bg-[#0F2327] text-white"
                  : "bg-white text-[#556B6F] border border-[#D9E3DF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[#556B6F] bg-white">
            Aucune opération ne correspond aux critères.
          </Card>
        ) : (
          filtered.map((op) => {
            const isCredit = op.type === "credit";
            return (
              <Card
                key={op.id}
                onClick={() => onNavigate("customers/detail", { id: op.customerId })}
                className="p-4 bg-white hover:border-[#0CA770]/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
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
                      <div className="font-bold text-sm text-[#0F2327] flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#0CA770]" />
                        <span>{op.customerName}</span>
                      </div>
                      <div className="text-xs text-[#556B6F] flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(op.date)}
                        </span>
                        {isCredit && op.dueDate && (
                          <span className="bg-amber-50 text-amber-800 rounded px-1.5 py-0.2">
                            Échéance : {formatDate(op.dueDate)}
                          </span>
                        )}
                        {!isCredit && op.paymentMethod && (
                          <span className="bg-gray-100 rounded px-1.5 py-0.2 text-gray-700">
                            {op.paymentMethod === "mobile_money"
                              ? "Mobile Money"
                              : op.paymentMethod === "cash"
                              ? "Espèces"
                              : op.paymentMethod}
                          </span>
                        )}
                        {op.description && (
                          <span className="text-gray-500">• {op.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-bold block ${
                        isCredit ? "text-red-600" : "text-[#0CA770]"
                      }`}
                    >
                      {isCredit ? "+" : "-"}{" "}
                      {formatCurrency(op.amount, currency, currencyDecimals)}
                    </span>
                    <span className="text-[10px] text-[#556B6F]">
                      {isCredit ? "Crédit" : "Remboursement"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
