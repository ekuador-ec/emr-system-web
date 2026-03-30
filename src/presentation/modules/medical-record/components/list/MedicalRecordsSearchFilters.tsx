import { useForm } from "react-hook-form";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useEffect } from "react";
import { useDebounce } from "@/presentation/modules/shared/hooks/useDebounce";

interface FilterFormData {
  search: string;
}

export function MedicalRecordsSearchFilters() {
  const { setFilters, filters } = useMedicalRecordStore();
  const { register, watch } = useForm<FilterFormData>({
    defaultValues: {
      search: filters.search,
    },
  });

  const search = watch("search");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
       setFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, setFilters]);

  return (
    <div className="card" style={{ padding: "var(--space-4)", display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
      <div style={{ position: "relative", flex: 1 }}>
        <input
          type="text"
          placeholder="Buscar por paciente, cédula..."
          className="input-field"
          style={{ paddingLeft: "var(--space-10)", width: "100%" }}
          {...register("search")}
        />
        <div style={{ position: "absolute", left: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}>
          <Icon name="icon-search" size={20} />
        </div>
      </div>
    </div>
  );
}
