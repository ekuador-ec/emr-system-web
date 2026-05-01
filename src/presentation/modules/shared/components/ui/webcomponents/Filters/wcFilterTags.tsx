import { WcFilterTag } from "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterTag";
import "@/presentation/modules/shared/components/ui/webcomponents/Filters/wcFilterTags.css";

export type FilterItem = {
  id: string;
  label: string;
  value: string;
};

type WcFilterTagsProps = {
  filters: FilterItem[];
  onRemove: (filterId: string) => void;
};

export function WcFilterTags({ filters, onRemove }: WcFilterTagsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="wc-filter-tags">
      <div className="wc-filter-tags__list">
        {filters.map((filter) => (
          <WcFilterTag
            key={filter.id}
            label={filter.label}
            value={filter.value}
            onRemove={() => onRemove(filter.id)}
          />
        ))}
      </div>
    </div>
  );
}
