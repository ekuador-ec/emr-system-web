import "./SegmentedControl.css";

export interface SegmentedOption<T extends string> {
  value: T | null;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  label?: string;
  options: Array<SegmentedOption<T>>;
  value: T | null;
  onChange: (value: T | null) => void;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="group" aria-label={label}>
      {label ? <span className="segmented-control__label">{label}</span> : null}
      <div className="segmented-control__group">
        {options.map((option) => {
          const key = option.value ?? "__all__";
          const isActive = option.value === value;
          return (
            <button
              key={key}
              type="button"
              className={`segmented-control__button${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
