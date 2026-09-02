import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#266DF0] font-inter text-sm font-semibold text-white shadow-[0_10px_24px_rgba(38,109,240,0.22)] transition-all hover:-translate-y-[1px] hover:bg-[#1F62DD] hover:shadow-[0_14px_28px_rgba(38,109,240,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading && <Loader2 size={17} className="animate-spin" />}

      {children}
    </button>
  );
};

export default Button;  