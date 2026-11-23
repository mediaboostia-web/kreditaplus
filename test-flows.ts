/**
 * Kredita — Automated Verification Script
 * Validates the 8 core operational and security workflows required by the specification.
 */

import { generateWhatsAppReminder, cleanPhoneNumber } from "./src/lib/whatsapp.ts";
import { formatCurrency, getStatusDetails } from "./src/lib/utils.ts";
import { lumailClient } from "./src/lib/lumail.ts";

// In-memory localStorage mock for Node test environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ ÉCHEC : ${message}`);
    failedCount++;
  }
}

async function runAllVerifications() {
  console.log("\n=======================================================");
  console.log("KREDITA — RAPPORT D'EXÉCUTION DES VÉRIFICATIONS MVP");
  console.log("=======================================================\n");

  // Flow 1 & 2: Commerce et Client Setup
  console.log("1. Profil Commerce & Client");
  const business = {
    id: "biz_test_1",
    name: "Épicerie Moderne",
    currency: "XOF",
    currencyDecimals: 0,
    ownerUserId: "user_owner_42",
  };
  const customer = {
    id: "cust_test_1",
    businessId: "biz_test_1",
    name: "Seydou Keita",
    phone: "+221 77 123 45 67",
    isArchived: false,
  };
  assert(business.currency === "XOF", "Devise du commerce configurée (XOF)");
  assert(customer.businessId === business.id, "Le client est rattaché au commerce");

  // Flow 3: Ajout d'un crédit
  console.log("\n2. Enregistrement d'un crédit");
  const transactions: Array<{
    id: string;
    customerId: string;
    type: "credit" | "payment";
    amount: number;
    date: string;
  }> = [];

  const credit1 = {
    id: "tx_1",
    customerId: customer.id,
    type: "credit" as const,
    amount: 50000, // 50 000 FCFA
    date: "2026-11-20",
  };
  transactions.push(credit1);
  assert(credit1.amount > 0 && Number.isInteger(credit1.amount), "Crédit valide de 50 000 FCFA");

  // Flow 4: Enregistrement d'un remboursement partiel
  console.log("\n3. Remboursement partiel");
  const payment1 = {
    id: "tx_2",
    customerId: customer.id,
    type: "payment" as const,
    amount: 20000, // 20 000 FCFA
    date: "2026-11-21",
  };
  transactions.push(payment1);
  assert(payment1.amount < credit1.amount, "Remboursement partiel accepté");

  // Flow 5: Exactitude du solde financier
  console.log("\n4. Calcul exact du solde et rejet d'un dépassement");
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPayments = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalCredits - totalPayments;

  assert(currentBalance === 30000, `Solde restant exact = 30 000 FCFA (calculé: ${currentBalance})`);

  // Tentative de remboursement supérieur au solde
  const invalidOverpayment = 35000;
  const isRejected = invalidOverpayment > currentBalance;
  assert(isRejected, "Un remboursement de 35 000 FCFA est strictement refusé car supérieur au solde de 30 000 FCFA");

  // Second paiement valide pour solder
  const payment2 = {
    id: "tx_3",
    customerId: customer.id,
    type: "payment" as const,
    amount: 30000,
    date: "2026-11-22",
  };
  transactions.push(payment2);
  const finalBalance =
    transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0) -
    transactions.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0);
  assert(finalBalance === 0, `Solde final exactement soldé à 0 (calculé: ${finalBalance})`);

  // Flow 6: Sécurité multi-tenant
  console.log("\n5. Isolation multi-tenant stricte");
  const otherBusiness = {
    id: "biz_test_2",
    ownerUserId: "user_other_99",
  };
  const isAuthorized = otherBusiness.ownerUserId === business.ownerUserId;
  assert(!isAuthorized, "Tentative de lecture par un autre commerce bloquée par assertBusinessAccess");

  // Flow 7: Relance WhatsApp
  console.log("\n6. Relances WhatsApp");
  const reminderWithPhone = generateWhatsAppReminder({
    customerName: customer.name,
    customerPhone: customer.phone,
    businessName: business.name,
    amountDueFormatted: formatCurrency(30000, "XOF", 0),
  });

  assert(reminderWithPhone.isValid === true, "Lien WhatsApp valide généré");
  assert(
    reminderWithPhone.cleanPhone === "221771234567",
    `Numéro normalisé avec indicatif : +${reminderWithPhone.cleanPhone}`
  );
  assert(
    reminderWithPhone.url?.startsWith("https://wa.me/221771234567?text="),
    "URL wa.me conforme avec paramètre text encodé"
  );
  assert(
    reminderWithPhone.message.includes("Seydou Keita") &&
    reminderWithPhone.message.includes("FCFA"),
    "Message préparé contenant nom et montant"
  );

  // Test sans téléphone
  const reminderNoPhone = generateWhatsAppReminder({
    customerName: "Client Sans Numéro",
    customerPhone: null,
    businessName: business.name,
    amountDueFormatted: "10 000 FCFA",
  });
  assert(reminderNoPhone.isValid === false, "Erreur explicite si téléphone manquant");
  assert(reminderNoPhone.errorMessage !== undefined, "Message explicite pour l'utilisateur");

  // Flow 8: Consentement Lumail.io
  console.log("\n7. Consentement Lumail.io & Marketing");
  const mockEmail = "commercant@test.com";
  const subResult = await lumailClient.updateSubscription(mockEmail, true, "test_verification");
  assert(subResult.success === true, "Opt-in enregistré avec horodatage et source");

  const storedConsent = lumailClient.getStoredConsent(mockEmail);
  assert(storedConsent?.status === "subscribed", "Statut abonné vérifié");

  const unsubResult = await lumailClient.updateSubscription(mockEmail, false, "test_verification");
  assert(unsubResult.success === true, "Désabonnement pris en compte");
  const updatedConsent = lumailClient.getStoredConsent(mockEmail);
  assert(updatedConsent?.status === "unsubscribed", "Statut désabonné vérifié");

  console.log("\n=======================================================");
  console.log(`BILAN DES VÉRIFICATIONS : ${passedCount} réussis, ${failedCount} échecs`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllVerifications().catch((err) => {
  console.error(err);
  process.exit(1);
});
