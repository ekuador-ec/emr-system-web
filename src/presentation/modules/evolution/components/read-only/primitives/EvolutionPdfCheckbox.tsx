interface EvolutionPdfCheckboxProps {
  label: string;
  checked: boolean | null | undefined;
  inline?: boolean;
}

export function EvolutionPdfCheckbox({
  label,
  checked,
  inline = false,
}: EvolutionPdfCheckboxProps) {
  const isUnknown = checked === null || checked === undefined;
  const symbol = isUnknown ? "[ ]" : checked ? "[X]" : "[ ]";
  const classes = [
    "em-pdf-checkbox",
    inline ? "em-pdf-checkbox--inline" : "",
    checked ? "em-pdf-checkbox--checked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span className="em-pdf-checkbox__box" aria-hidden="true">
        {symbol}
      </span>
      <span className="em-pdf-checkbox__label">{label}</span>
    </span>
  );
}
