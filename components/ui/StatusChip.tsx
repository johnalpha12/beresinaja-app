import { Check } from "lucide-react";

type StatusType = "in-progress" | "completed" | "pending" | "default";

interface StatusChipProps {
  statusText: string;
  statusType?: StatusType;
  className?: string;
}

export function StatusChip({ 
  statusText, 
  statusType = "default",
  className = ""
}: StatusChipProps) {
  const styles = {
    "in-progress": "bg-[#4FC3F7]/20 text-[#0288D1] border-[#4FC3F7]/50",
    "completed": "bg-transparent text-[#0288D1] border-[#0288D1] border-[1.5px]",
    "pending": "bg-[#9CA3AF]/10 text-[#6B6B6B] border-[#9CA3AF]/30",
    "default": "bg-[#F8FAFC] text-[#4A4A4A] border-[#E5E7EB]"
  };

  return (
    <div 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5
        rounded-full border
        text-sm
        ${styles[statusType]}
        ${className}
      `}
    >
      {statusType === "completed" && <Check className="w-3.5 h-3.5" />}
      <span>{statusText}</span>
    </div>
  );
}
