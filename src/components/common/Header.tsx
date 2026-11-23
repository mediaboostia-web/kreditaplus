import React from "react";
import { useAuth } from "@/lib/auth-client";
import { LogOut, Store, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  businessName?: string;
  currency?: string;
  onNavigate: (route: string) => void;
}

export function Header({ businessName = "Mon Commerce", currency = "XOF", onNavigate }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D9E3DF] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <img 
            src="/kredita-logo.png" 
            alt="Kredita - Le crédit en toute confiance" 
            className="h-8 w-auto object-contain"
            onError={(e) => {
              // Fallback text logo if image not loaded
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="hidden sm:block">
            <span className="text-xs text-[#556B6F] font-medium tracking-tight">
              Le crédit en toute confiance.
            </span>
          </div>
        </div>

        {/* Business and User controls */}
        <div className="flex items-center gap-2">
          {/* Business indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#D9E3DF] bg-[#F8FAF9] px-3 py-1 text-xs font-medium text-[#0F2327]">
            <Store className="h-3.5 w-3.5 text-[#0CA770]" />
            <span className="max-w-[140px] truncate">{businessName}</span>
            <span className="rounded bg-[#B4F5D8] px-1.5 py-0.5 text-[10px] font-bold text-[#0F2327]">
              {currency}
            </span>
          </div>

          {/* User profile / Log out */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-medium text-[#556B6F]">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  signOut();
                  onNavigate("login");
                }}
                className="text-[#556B6F] hover:text-red-600 hover:bg-red-50 h-9 px-2"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1 text-xs">Quitter</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
