import { Loader2 } from "lucide-react";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function PrimaryButton({ 
  label, 
  onClick, 
  isLoading = false, 
  disabled = false,
  className = "",
  type = "button"
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full h-12 rounded-[20px] 
        bg-[#0288D1] text-white 
        transition-all duration-200
        shadow-md shadow-[#0288D1]/20
        hover:bg-[#0277BD] hover:shadow-lg hover:shadow-[#0288D1]/30
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      <span>{isLoading ? "Memproses..." : label}</span>
    </button>
  );
}
