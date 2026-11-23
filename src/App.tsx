import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-client";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { Login } from "@/pages/Login";
import { Onboarding } from "@/pages/Onboarding";
import { Dashboard } from "@/pages/Dashboard";
import { CustomersList, CustomerItem } from "@/pages/CustomersList";
import { CustomerDetail } from "@/pages/CustomerDetail";
import { AddCustomer } from "@/pages/AddCustomer";
import { AddCredit } from "@/pages/AddCredit";
import { AddPayment } from "@/pages/AddPayment";
import { Activity } from "@/pages/Activity";
import { Settings } from "@/pages/Settings";

// Seed data demonstrating real small business usage in West/Central Africa (XOF currency)
const INITIAL_BUSINESS = {
  id: "biz_kredita_1",
  name: "Alimentation Générale Diallo",
  ownerName: "Amadou Diallo",
  country: "Sénégal",
  city: "Dakar",
  phone: "+221 77 123 45 67",
  currency: "XOF",
  currencyDecimals: 0,
  language: "fr",
  timezone: "Africa/Dakar",
};

const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: "cust_1",
    name: "Fatou Sow",
    phone: "+221 77 456 78 90",
    notes: "Boutique de couture en face, cliente fidèle",
    isArchived: false,
    totalCredits: 35000,
    totalPayments: 15000,
    outstandingBalance: 20000,
    status: "due_soon",
  },
  {
    id: "cust_2",
    name: "Mamadou Ba",
    phone: "+221 70 890 12 34",
    notes: "Marché Kermel",
    isArchived: false,
    totalCredits: 50000,
    totalPayments: 10000,
    outstandingBalance: 40000,
    status: "overdue",
  },
  {
    id: "cust_3",
    name: "Aïssatou Ndiaye",
    phone: "+221 76 345 67 89",
    notes: "Règle toujours avant la fin du mois",
    isArchived: false,
    totalCredits: 25000,
    totalPayments: 25000,
    outstandingBalance: 0,
    status: "settled",
  },
  {
    id: "cust_4",
    name: "Ousmane Kane",
    phone: null, // intentionally without phone to test error banner
    notes: "Voisin du quartier",
    isArchived: false,
    totalCredits: 15000,
    totalPayments: 5000,
    outstandingBalance: 10000,
    status: "up_to_date",
  },
];

export interface TransactionRecord {
  id: string;
  customerId: string;
  customerName: string;
  type: "credit" | "payment";
  amount: number;
  date: string;
  dueDate?: string;
  paymentMethod?: "cash" | "mobile_money" | "transfer" | "other";
  reference?: string;
  description?: string;
}

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx_1",
    customerId: "cust_2",
    customerName: "Mamadou Ba",
    type: "credit" as const,
    amount: 50000,
    date: "2026-11-10",
    dueDate: "2026-11-20",
    description: "Sac de riz 50kg + carton de lait",
  },
  {
    id: "tx_2",
    customerId: "cust_1",
    customerName: "Fatou Sow",
    type: "credit" as const,
    amount: 35000,
    date: "2026-11-15",
    dueDate: "2026-11-25",
    description: "Huile 20L + sucre",
  },
  {
    id: "tx_3",
    customerId: "cust_2",
    customerName: "Mamadou Ba",
    type: "payment" as const,
    amount: 10000,
    date: "2026-11-18",
    paymentMethod: "mobile_money" as const,
    reference: "WAVE-987214",
    description: "Acompte par Wave",
  },
  {
    id: "tx_4",
    customerId: "cust_1",
    customerName: "Fatou Sow",
    type: "payment" as const,
    amount: 15000,
    date: "2026-11-19",
    paymentMethod: "cash" as const,
    description: "Espèces au comptoir",
  },
  {
    id: "tx_5",
    customerId: "cust_3",
    customerName: "Aïssatou Ndiaye",
    type: "credit" as const,
    amount: 25000,
    date: "2026-11-01",
    dueDate: "2026-11-15",
    description: "Divers produits alimentaires",
  },
  {
    id: "tx_6",
    customerId: "cust_3",
    customerName: "Aïssatou Ndiaye",
    type: "payment" as const,
    amount: 25000,
    date: "2026-11-14",
    paymentMethod: "mobile_money" as const,
    reference: "OM-441092",
    description: "Paiement total par Orange Money",
  },
];

function AppContent() {
  const { user, isLoading } = useAuth();

  // Navigation route state
  const [currentRoute, setCurrentRoute] = useState<string>("dashboard");
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  // Business and data state
  const [business, setBusiness] = useState(INITIAL_BUSINESS);
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);

  // Recalculate customer balance from transaction history
  const recalculateBalances = (
    currentCusts: CustomerItem[],
    currentTxs: TransactionRecord[]
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return currentCusts.map((c) => {
      const custTxs = currentTxs.filter((t) => t.customerId === c.id);
      let credits = 0;
      let payments = 0;
      let hasOverdue = false;
      let hasDueSoon = false;

      for (const t of custTxs) {
        if (t.type === "credit") {
          credits += t.amount;
          if (t.dueDate) {
            if (t.dueDate < today) hasOverdue = true;
            else if (t.dueDate <= threeDays) hasDueSoon = true;
          }
        } else if (t.type === "payment") {
          payments += t.amount;
        }
      }

      const bal = Math.max(0, credits - payments);
      let status: CustomerItem["status"] = "up_to_date";
      if (bal === 0) status = "settled";
      else if (hasOverdue) status = "overdue";
      else if (hasDueSoon) status = "due_soon";

      return {
        ...c,
        totalCredits: credits,
        totalPayments: payments,
        outstandingBalance: bal,
        status,
      };
    });
  };

  const navigate = (route: string, params: Record<string, string> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3">
          <img src="/kredita-logo.png" alt="Kredita" className="h-8 animate-pulse" />
          <span className="text-xs text-[#556B6F]">Chargement de votre espace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => navigate("dashboard")} />;
  }

  // Compute live dashboard metrics
  const totalOutstandingBalance = customers
    .filter((c) => !c.isArchived)
    .reduce((sum, c) => sum + c.outstandingBalance, 0);

  const customersWithBalanceCount = customers.filter(
    (c) => !c.isArchived && c.outstandingBalance > 0
  ).length;

  const overdueCount = customers.filter(
    (c) => !c.isArchived && c.status === "overdue"
  ).length;

  const dueSoonCount = customers.filter(
    (c) => !c.isArchived && c.status === "due_soon"
  ).length;

  const reimbursedThisMonth = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReimbursedAllTime = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const recentOperations = transactions.slice(0, 5);

  // Business mutations
  const handleUpdateBusiness = async (data: Partial<typeof business>) => {
    setBusiness((prev) => ({ ...prev, ...data }));
  };

  // Customer mutations
  const handleAddCustomer = async (data: {
    name: string;
    phone?: string;
    notes?: string;
  }) => {
    const newId = `cust_${Date.now()}`;
    const newCust: CustomerItem = {
      id: newId,
      name: data.name,
      phone: data.phone || null,
      notes: data.notes || undefined,
      isArchived: false,
      totalCredits: 0,
      totalPayments: 0,
      outstandingBalance: 0,
      status: "settled",
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newId;
  };

  const handleToggleArchive = async (customerId: string, archive: boolean) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, isArchived: archive } : c))
    );
  };

  // Transaction mutations
  const handleAddCredit = async (data: {
    customerId: string;
    amount: number;
    date: string;
    dueDate?: string;
    description?: string;
    idempotencyKey?: string;
  }) => {
    const customer = customers.find((c) => c.id === data.customerId);
    const newTx = {
      id: `tx_${Date.now()}`,
      customerId: data.customerId,
      customerName: customer ? customer.name : "Client",
      type: "credit" as const,
      amount: data.amount,
      date: data.date,
      dueDate: data.dueDate,
      description: data.description,
    };

    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    setCustomers((prev) => recalculateBalances(prev, nextTxs));
    return newTx.id;
  };

  const handleAddPayment = async (data: {
    customerId: string;
    amount: number;
    date: string;
    paymentMethod: "cash" | "mobile_money" | "transfer" | "other";
    reference?: string;
    description?: string;
    idempotencyKey?: string;
  }) => {
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error("Client introuvable");

    if (data.amount > customer.outstandingBalance) {
      throw new Error(
        `Le montant du remboursement (${data.amount}) ne peut pas dépasser le solde dû (${customer.outstandingBalance}).`
      );
    }

    const newTx = {
      id: `tx_${Date.now()}`,
      customerId: data.customerId,
      customerName: customer.name,
      type: "payment" as const,
      amount: data.amount,
      date: data.date,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      description: data.description,
    };

    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    setCustomers((prev) => recalculateBalances(prev, nextTxs));
    return newTx.id;
  };

  // Selected customer for detail view
  const currentDetailCustomer = customers.find((c) => c.id === routeParams.id);
  const currentCustomerTxs = transactions.filter(
    (t) => t.customerId === routeParams.id
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#0F2327]">
      <Header
        businessName={business.name}
        currency={business.currency}
        onNavigate={navigate}
      />

      <main className="mx-auto max-w-5xl px-4 py-4">
        {currentRoute === "dashboard" && (
          <Dashboard
            business={business}
            metrics={{
              totalOutstandingBalance,
              customersWithBalanceCount,
              overdueCount,
              dueSoonCount,
              totalActiveCustomers: customers.filter((c) => !c.isArchived).length,
              reimbursedThisMonth,
              totalReimbursedAllTime,
              recentOperations,
            }}
            onNavigate={navigate}
          />
        )}

        {currentRoute === "customers" && (
          <CustomersList
            business={business}
            customers={customers}
            onNavigate={navigate}
          />
        )}

        {currentRoute === "customers/detail" && currentDetailCustomer && (
          <CustomerDetail
            business={business}
            customer={{
              ...currentDetailCustomer,
              transactions: currentCustomerTxs,
            }}
            onNavigate={navigate}
            onToggleArchive={handleToggleArchive}
          />
        )}

        {currentRoute === "customers/new" && (
          <AddCustomer onNavigate={navigate} onSubmit={handleAddCustomer} />
        )}

        {currentRoute === "credits/new" && (
          <AddCredit
            business={business}
            customers={customers.filter((c) => !c.isArchived)}
            preselectedCustomerId={routeParams.customerId}
            onNavigate={navigate}
            onSubmit={handleAddCredit}
          />
        )}

        {currentRoute === "payments/new" && (
          <AddPayment
            business={business}
            customers={customers.filter((c) => !c.isArchived)}
            preselectedCustomerId={routeParams.customerId}
            onNavigate={navigate}
            onSubmit={handleAddPayment}
          />
        )}

        {currentRoute === "activity" && (
          <Activity
            business={business}
            transactions={transactions}
            onNavigate={navigate}
          />
        )}

        {currentRoute === "settings" && (
          <Settings
            business={business}
            onUpdateBusiness={handleUpdateBusiness}
            onNavigate={navigate}
          />
        )}
      </main>

      <BottomNav currentRoute={currentRoute} onNavigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
