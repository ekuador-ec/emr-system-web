import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterTag.css";

type WcFilterTagProps = {
  label: string;
  value: string;
  onRemove: () => void;
};

export function WcFilterTag({ label, value, onRemove }: WcFilterTagProps) {
  return (
    <div className="wc-filter-tag">
      <span className="wc-filter-tag__label">{label}:</span>
      <span className="wc-filter-tag__value">{value}</span>
      <button
        type="button"
        className="wc-filter-tag__remove"
        onClick={onRemove}
        aria-label={`Remove filter: ${label} ${value}`}
        title="Remover filtro"
      >
        <Icon name="icon-x" size={12} />
      </button>
    </div>
  );
}
