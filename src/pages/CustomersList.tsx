import React, { useState } from "react";
import { formatCurrency, getStatusDetails } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import {
  Search,
  UserPlus,
  Phone,
  ArrowRight,
  Filter,
  CheckCircle,
} from "lucide-react";

export interface CustomerItem {
  id: string;
  name: string;
  phone?: string | null;
  notes?: string;
  isArchived: boolean;
  totalCredits: number;
  totalPayments: number;
  outstandingBalance: number;
  status: "settled" | "overdue" | "due_soon" | "up_to_date";
}

interface CustomersListProps {
  business: {
    name: string;
    currency: string;
    currencyDecimals: number;
  };
  customers: CustomerItem[];
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function CustomersList({
  business,
  customers,
  onNavigate,
}: CustomersListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active_debt" | "settled" | "archived">("all");

  const filteredCustomers = customers.filter((c) => {
    // Search query filter
    const term = search.toLowerCase().trim();
    if (term) {
      const matchName = c.name.toLowerCase().includes(term);
      const matchPhone = c.phone?.toLowerCase().includes(term);
      if (!matchName && !matchPhone) return false;
    }

    // Status / archive tab filter
    if (filter === "archived") {
      return c.isArchived;
    }
    if (c.isArchived) {
      return false; // hide archived on other tabs
    }
    if (filter === "active_debt") {
      return c.outstandingBalance > 0;
    }
    if (filter === "settled") {
      return c.outstandingBalance === 0;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header and Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F2327]">Fiches Clients</h1>
          <p className="text-xs text-[#556B6F]">
            {customers.length} client(s) enregistrés
          </p>
        </div>
        <Button
          onClick={() => onNavigate("customers/new")}
          className="bg-[#0CA770] hover:bg-[#0a8f60] text-white text-xs font-semibold h-10"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Nouveau client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#556B6F]" />
        <Input
          type="text"
          placeholder="Rechercher par nom ou numéro de téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {[
          { id: "all", label: "Tous" },
          { id: "active_debt", label: "Avec solde dû" },
          { id: "settled", label: "Soldés" },
          { id: "archived", label: "Archivés" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-[#0F2327] text-white"
                : "bg-white text-[#556B6F] border border-[#D9E3DF] hover:bg-[#F8FAF9]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed">
            <p className="text-sm text-[#556B6F]">
              Aucun client ne correspond aux critères de recherche.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="mt-3 text-xs"
            >
              Réinitialiser les filtres
            </Button>
          </Card>
        ) : (
          filteredCustomers.map((customer) => {
            const statusInfo = getStatusDetails(customer.status);
            const hasDueBalance = customer.outstandingBalance > 0;

            return (
              <Card
                key={customer.id}
                onClick={() => onNavigate("customers/detail", { id: customer.id })}
                className="p-4 bg-white hover:border-[#0CA770]/50 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#0F2327]">
                        {customer.name}
                      </span>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                      {customer.isArchived && (
                        <Badge variant="outline" className="text-gray-500 text-[10px]">
                          Archivé
                        </Badge>
                      )}
                    </div>

                    {customer.phone ? (
                      <div className="flex items-center text-xs text-[#556B6F]">
                        <Phone className="h-3 w-3 mr-1 text-[#0CA770]" />
                        <span>{customer.phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Sans téléphone
                      </span>
                    )}
                  </div>

                  {/* Financial Balance Summary */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-[#556B6F] block">
                      Solde restant
                    </span>
                    <span
                      className={`text-base font-black ${
                        hasDueBalance ? "text-red-600" : "text-[#0CA770]"
                      }`}
                    >
                      {formatCurrency(
                        customer.outstandingBalance,
                        business.currency,
                        business.currencyDecimals
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer Actions on Card */}
                <div className="mt-3.5 pt-3 border-t border-[#D9E3DF] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#556B6F]">
                    Total emprunté : {formatCurrency(customer.totalCredits, business.currency, business.currencyDecimals)}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* WhatsApp Action only if customer has due balance AND a phone number */}
                    {hasDueBalance && customer.phone && (
                      <WhatsAppButton
                        customerName={customer.name}
                        customerPhone={customer.phone}
                        businessName={business.name}
                        amountDueFormatted={formatCurrency(
                          customer.outstandingBalance,
                          business.currency,
                          business.currencyDecimals
                        )}
                        size="sm"
                      />
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate("customers/detail", { id: customer.id })}
                      className="h-8 text-xs text-[#0CA770] hover:bg-[#B4F5D8]/20"
                    >
                      <span>Fiche</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
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
