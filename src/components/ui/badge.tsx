import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0CA770] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#B4F5D8] text-[#0F2327]",
        success:
          "border-[#0CA770]/30 bg-[#0CA770]/10 text-[#0CA770]",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800",
        destructive:
          "border-red-200 bg-red-50 text-red-700",
        outline:
          "border-[#D9E3DF] text-[#0F2327]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
