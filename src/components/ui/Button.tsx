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
      "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FF5500]/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]";

    const variants = {
      primary:
        "bg-gradient-to-b from-[#FF5500] to-[#E04B00] text-white hover:from-[#E04B00] hover:to-[#CC4300] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(255,85,0,0.25)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_16px_rgba(255,85,0,0.3)] border border-[#E04B00]/60",
      secondary:
        "bg-white text-zinc-800 hover:bg-zinc-50 hover:text-[#FF5500] border border-zinc-200/80 hover:border-[#FF5500]/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      outline:
        "bg-transparent text-[#FF5500] border border-[#FF5500]/30 hover:bg-[#FF5500]/[0.04] hover:border-[#FF5500]/50",
      ghost:
        "bg-transparent text-zinc-600 hover:text-[#FF5500] hover:bg-[#FF5500]/[0.04]",
      danger:
        "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    };

    const sizes = {
      sm: "text-[12px] px-3 py-1.5 gap-1.5",
      md: "text-[13px] px-4 py-2 gap-2",
      lg: "text-[14px] px-5 py-2.5 gap-2 font-bold",
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
