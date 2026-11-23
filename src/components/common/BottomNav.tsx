import React from "react";
import { LayoutDashboard, Users, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNav({ currentRoute, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
    },
    {
      id: "customers",
      label: "Clients",
      icon: Users,
    },
    {
      id: "activity",
      label: "Activité",
      icon: Clock,
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-[#D9E3DF] bg-white pb-safe">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id || currentRoute.startsWith(`${item.id}/`);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-1 transition-colors select-none",
                "min-h-[48px] touch-manipulation",
                isActive
                  ? "text-[#0CA770] font-semibold"
                  : "text-[#556B6F] hover:text-[#0F2327]"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#0CA770]" />
                )}
              </div>
              <span className="mt-1 text-[11px] leading-tight tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
