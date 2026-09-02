const Input = ({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block font-inter text-sm font-semibold text-[#31373D]">
          {label}
        </label>
      )}

      <div className="group relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA1AA] transition-colors group-focus-within:text-[#266DF0]"
          />
        )}

        <input
          type={type}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-[#D3D5D9] bg-white ${
            Icon ? "pl-11" : "px-4"
          } pr-4 font-inter text-sm text-[#232529] outline-none transition-all placeholder:text-[#B2B6BD] hover:border-[#B2B6BD] focus:border-[#266DF0] focus:ring-4 focus:ring-[#D9E5FC]`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;