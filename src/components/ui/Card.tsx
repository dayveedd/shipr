"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "interactive";
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  const baseStyles =
    "rounded-xl bg-white border border-zinc-200 shadow-soft-card transition-all duration-200";

  const variants = {
    default: "",
    hover: "hover:border-zinc-300 hover:shadow-card-glow hover:-translate-y-0.5",
    interactive:
      "cursor-pointer hover:border-zinc-400 hover:shadow-card-glow active:scale-[0.99]",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
