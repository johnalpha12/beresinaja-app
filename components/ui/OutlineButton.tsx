interface OutlineButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function OutlineButton({
  label,
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: OutlineButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full h-12 rounded-[20px]
        border-2 border-[#0288D1] text-[#0288D1]
        transition-all duration-200
        hover:bg-[#0288D1]/5
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {label}
    </button>
  );
}
