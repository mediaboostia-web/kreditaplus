/**
 * Kredita WhatsApp Reminder Generator
 * Produces compliant wa.me links with prepared reminder templates.
 * The merchant verifies and hits send manually.
 */

export interface WhatsAppReminderOptions {
  customerName: string;
  customerPhone?: string | null;
  businessName: string;
  amountDueFormatted: string;
}

export interface WhatsAppReminderResult {
  url: string | null;
  message: string;
  isValid: boolean;
  cleanPhone: string | null;
  errorMessage?: string;
}

/**
 * Clean phone number: remove spaces, periods, dashes, plus signs, brackets.
 */
export function cleanPhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  return digitsOnly.length >= 8 ? digitsOnly : null;
}

/**
 * Generate prepared WhatsApp reminder message and wa.me link.
 */
export function generateWhatsAppReminder({
  customerName,
  customerPhone,
  businessName,
  amountDueFormatted,
}: WhatsAppReminderOptions): WhatsAppReminderResult {
  const preparedMessage = `Bonjour ${customerName.trim()}, selon le suivi de ${businessName.trim()}, il vous reste ${amountDueFormatted} à régler. Vous pouvez nous contacter pour convenir du paiement. Merci.`;

  if (!customerPhone || customerPhone.trim() === "") {
    return {
      url: null,
      message: preparedMessage,
      isValid: false,
      cleanPhone: null,
      errorMessage: "Aucun numéro de téléphone n'est enregistré pour ce client. Ajoutez son numéro pour préparer la relance WhatsApp.",
    };
  }

  const cleanPhone = cleanPhoneNumber(customerPhone);
  if (!cleanPhone) {
    return {
      url: null,
      message: preparedMessage,
      isValid: false,
      cleanPhone: null,
      errorMessage: `Le numéro "${customerPhone}" semble incomplet ou invalide. Renseignez un numéro avec l'indicatif pays (ex: 221771234567).`,
    };
  }

  const encodedMessage = encodeURIComponent(preparedMessage);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return {
    url,
    message: preparedMessage,
    isValid: true,
    cleanPhone,
  };
}
