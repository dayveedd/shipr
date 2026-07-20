"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center text-button rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5500]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#FF5500] text-white hover:bg-[#E04B00] shadow-orange-glow font-bold border border-[#FF5500]",
      secondary:
        "bg-white text-zinc-900 hover:bg-[#FFF2EC] hover:text-[#FF5500] border border-zinc-200 hover:border-[#FF5500]/40 shadow-sm",
      outline:
        "bg-transparent text-[#FF5500] border border-[#FF5500]/40 hover:bg-[#FFF2EC]",
      ghost:
        "bg-transparent text-zinc-600 hover:text-[#FF5500] hover:bg-[#FFF2EC]",
      danger:
        "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
