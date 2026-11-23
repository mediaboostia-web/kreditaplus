import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Plus,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

interface DashboardProps {
  business: {
    name: string;
    currency: string;
    currencyDecimals: number;
  };
  metrics: {
    totalOutstandingBalance: number;
    customersWithBalanceCount: number;
    overdueCount: number;
    dueSoonCount: number;
    totalActiveCustomers: number;
    reimbursedThisMonth: number;
    totalReimbursedAllTime: number;
    recentOperations: Array<{
      id: string;
      customerId: string;
      customerName: string;
      customerPhone?: string;
      type: "credit" | "payment";
      amount: number;
      date: string;
      description?: string;
      paymentMethod?: string;
    }>;
  };
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export function Dashboard({ business, metrics, onNavigate }: DashboardProps) {
  const { currency, currencyDecimals } = business;

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F2327] text-white p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg font-bold">Tableau de bord</h1>
          <p className="text-xs text-[#B4F5D8]">
            {business.name} • Suivi en temps réel
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onNavigate("credits/new")}
            className="h-10 text-xs font-semibold"
          >
            <Plus className="h-4 w-4 mr-1 text-[#0F2327]" />
            Nouveau crédit
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigate("payments/new")}
            className="h-10 bg-[#0CA770] hover:bg-[#099262] text-white text-xs font-semibold"
          >
            <ArrowDownLeft className="h-4 w-4 mr-1" />
            Remboursement
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate("customers/new")}
            className="h-10 bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-semibold"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Outstanding Credit */}
        <Card className="border-l-4 border-l-[#0CA770] bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-[#556B6F] uppercase tracking-wider">
              Total encore dû
            </span>
            <CardTitle className="text-2xl font-black text-[#0F2327] mt-1">
              {formatCurrency(
                metrics.totalOutstandingBalance,
                currency,
                currencyDecimals
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-[#556B6F]">
              <Users className="h-3.5 w-3.5 mr-1 text-[#0CA770]" />
              <span>
                {metrics.customersWithBalanceCount} client(s) ont un solde débiteur
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Reimbursed This Month */}
        <Card className="border-l-4 border-l-[#0CA770]/60 bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-[#556B6F] uppercase tracking-wider">
              Remboursé ce mois
            </span>
            <CardTitle className="text-2xl font-black text-[#0CA770] mt-1">
              {formatCurrency(
                metrics.reimbursedThisMonth,
                currency,
                currencyDecimals
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-[#556B6F]">
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-[#0CA770]" />
              <span>
                Cumul total : {formatCurrency(metrics.totalReimbursedAllTime, currency, currencyDecimals)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Credits */}
        <Card className="border-l-4 border-l-red-500 bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-[#556B6F] uppercase tracking-wider">
              Crédits en retard
            </span>
            <CardTitle className="text-2xl font-black text-red-600 mt-1">
              {metrics.overdueCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
              <span>Échéance dépassée • Relances nécessaires</span>
            </div>
          </CardContent>
        </Card>

        {/* Due Soon / Total Customers */}
        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-[#556B6F] uppercase tracking-wider">
              Bientôt dû (&lt; 3j)
            </span>
            <CardTitle className="text-2xl font-black text-amber-800 mt-1">
              {metrics.dueSoonCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-[#556B6F]">
              <Clock className="h-3.5 w-3.5 mr-1 text-amber-600" />
              <span>Sur un total de {metrics.totalActiveCustomers} clients actifs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Operations Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#D9E3DF]">
          <div>
            <CardTitle className="text-base font-bold text-[#0F2327]">
              Opérations récentes
            </CardTitle>
            <p className="text-xs text-[#556B6F]">
              Derniers crédits accordés et remboursements perçus
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("activity")}
            className="text-xs text-[#0CA770] font-semibold"
          >
            Tout voir
          </Button>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-[#D9E3DF]">
          {metrics.recentOperations.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#556B6F]">
              Aucune opération enregistrée pour le moment.
            </div>
          ) : (
            metrics.recentOperations.map((op) => {
              const isCredit = op.type === "credit";
              return (
                <div
                  key={op.id}
                  onClick={() => onNavigate("customers/detail", { id: op.customerId })}
                  className="flex items-center justify-between p-4 hover:bg-[#F8FAF9] cursor-pointer transition-colors"
                >
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
                        {op.customerName}
                      </div>
                      <div className="text-xs text-[#556B6F] flex items-center gap-2">
                        <span>{formatDate(op.date)}</span>
                        {op.description && (
                          <>
                            <span>•</span>
                            <span className="max-w-[150px] truncate">
                              {op.description}
                            </span>
                          </>
                        )}
                        {!isCredit && op.paymentMethod && (
                          <span className="rounded bg-gray-100 px-1 py-0.2 text-[10px] text-gray-700">
                            {op.paymentMethod === "mobile_money"
                              ? "Mobile Money"
                              : op.paymentMethod === "cash"
                              ? "Espèces"
                              : op.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
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
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
