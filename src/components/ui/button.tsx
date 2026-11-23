import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0CA770] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-[#0CA770] text-white hover:bg-[#0a8f60] shadow-sm",
        secondary:
          "bg-[#B4F5D8] text-[#0F2327] hover:bg-[#9feec9] font-semibold",
        dark:
          "bg-[#0F2327] text-white hover:bg-[#18363c]",
        outline:
          "border border-[#D9E3DF] bg-white text-[#0F2327] hover:bg-[#F8FAF9]",
        ghost:
          "text-[#0F2327] hover:bg-[#EEF3F1]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        link:
          "text-[#0CA770] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 min-h-[44px]", // 44px mobile tactile target
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-base min-h-[48px]",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
