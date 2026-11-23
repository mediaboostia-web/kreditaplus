import React, { useState } from "react";
import { generateWhatsAppReminder } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MessageSquare, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

interface WhatsAppButtonProps {
  customerName: string;
  customerPhone?: string | null;
  businessName: string;
  amountDueFormatted: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function WhatsAppButton({
  customerName,
  customerPhone,
  businessName,
  amountDueFormatted,
  className,
  size = "sm",
}: WhatsAppButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const reminder = generateWhatsAppReminder({
    customerName,
    customerPhone,
    businessName,
    amountDueFormatted,
  });

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomMessage(reminder.message);
    setIsModalOpen(true);
  };

  const handleLaunchWhatsApp = () => {
    if (!reminder.cleanPhone) return;
    const url = `https://wa.me/${reminder.cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size={size}
        onClick={handleOpenModal}
        className={className}
        title="Préparer une relance WhatsApp"
      >
        <MessageSquare className="h-4 w-4 mr-1.5 text-[#0F2327]" />
        <span>Relance WhatsApp</span>
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Préparer la relance WhatsApp"
        description="Le message est préparé pour vous. Vous devez vérifier son contenu et l'envoyer vous-même sur WhatsApp."
      >
        <div className="space-y-4">
          {/* Phone check status banner */}
          {reminder.isValid ? (
            <div className="flex items-center gap-2 rounded-md bg-[#B4F5D8]/40 border border-[#0CA770]/30 p-3 text-xs text-[#0F2327]">
              <CheckCircle2 className="h-4 w-4 text-[#0CA770] shrink-0" />
              <div>
                <span className="font-semibold">Numéro destinataire : </span>
                <span>+{reminder.cleanPhone}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Attention : numéro manquant ou incomplet</span>
                <p className="mt-0.5 text-amber-800">{reminder.errorMessage}</p>
              </div>
            </div>
          )}

          {/* Prepared Message TextArea */}
          <div>
            <label className="block text-xs font-semibold text-[#0F2327] mb-1.5">
              Message préparé (modifiable) :
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={!reminder.isValid}
              className="w-full rounded-md border border-[#D9E3DF] p-3 text-sm text-[#0F2327] focus:border-[#0CA770] focus:ring-1 focus:ring-[#0CA770] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            />
            <p className="mt-1 text-[11px] text-[#556B6F]">
              Kredita n'envoie pas de message automatiquement. Le lien ci-dessous ouvre l'application WhatsApp officielle avec le message prérempli.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9E3DF]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!reminder.isValid}
              onClick={handleLaunchWhatsApp}
              className="bg-[#0CA770] text-white hover:bg-[#0a8f60]"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              <span>Ouvrir WhatsApp</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
