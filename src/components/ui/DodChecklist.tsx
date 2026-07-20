"use client";

import React from "react";
import { DefinitionOfDoneItem } from "@/types";
import { Code2, Globe, FileCheck, Layers } from "lucide-react";

interface DodChecklistProps {
  items: DefinitionOfDoneItem[];
  interactive?: boolean;
}

export const DodChecklist: React.FC<DodChecklistProps> = ({ items }) => {
  const getCategoryIcon = (category: DefinitionOfDoneItem["category"]) => {
    switch (category) {
      case "FRONTEND":
        return <Code2 className="w-4 h-4 text-[#FF5500]" />;
      case "DEPLOYMENT":
        return <Globe className="w-4 h-4 text-[#FF5500]" />;
      case "CODE_QUALITY":
        return <FileCheck className="w-4 h-4 text-[#FF5500]" />;
      default:
        return <Layers className="w-4 h-4 text-[#FF5500]" />;
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl bg-white border border-zinc-200 shadow-soft-card flex items-start gap-3 transition-all hover:border-[#FF5500]/40"
        >
          <div className="p-2 rounded-lg bg-[#FFF2EC] border border-[#FF5500]/20 shrink-0 mt-0.5">
            {getCategoryIcon(item.category)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-h3 text-zinc-900 text-sm font-bold">
                {item.title}
              </h4>
              <span className="px-2 py-0.5 rounded bg-[#FFF2EC] border border-[#FF5500]/20 text-[10px] font-mono text-[#FF5500] font-bold shrink-0">
                {item.category}
              </span>
            </div>

            <p className="text-body text-xs text-zinc-600 mt-1">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
