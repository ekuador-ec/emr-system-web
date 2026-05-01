import { useRef } from "react";
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/Searchs/wcSearchInput.css";

interface WcSearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value"
> {
  value: string;
  onValueChange: (value: string) => void;
  wrapperClassName?: string;
  showSearchIcon?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  showSubmitButton?: boolean;
  submitButtonLabel?: string;
  showSubmitIcon?: boolean;
  submitButtonIconOnly?: boolean;
  onSubmit?: () => void;
  submitButtonDisabled?: boolean;
}

function WcSearchInput(props: WcSearchInputProps) {
  const {
    value,
    onValueChange,
    onChange,
    wrapperClassName,
    showSearchIcon = true,
    showClearButton = true,
    onClear,
    showSubmitButton = false,
    submitButtonLabel = "Buscar",
    showSubmitIcon = true,
    submitButtonIconOnly = false,
    onSubmit,
    submitButtonDisabled = false,
    className,
    disabled,
    readOnly,
    onKeyDown,
    ...restProps
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const canRenderClearButton = showClearButton && !disabled && !readOnly;
  const hasSearchText = value.trim().length > 0;

  const containerClassName = `wc-search-input ${wrapperClassName ?? ""}`.trim();
  const hasTrailingAction = showSubmitButton || canRenderClearButton;
  const inputClassName =
    `wc-search-input__control ${showSearchIcon ? "has-leading-icon" : ""} ${hasTrailingAction ? "has-trailing-action" : ""} ${className ?? ""}`.trim();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
    onChange?.(event);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (event.key !== "Enter" || !onSubmit) {
      return;
    }
    event.preventDefault();
    onSubmit();
  };

  const handleClear = () => {
    if (!hasSearchText) {
      return;
    }

    onValueChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={containerClassName}>
      <div className="wc-search-input__field">
        {showSearchIcon ? (
          <span className="wc-search-input__icon" aria-hidden="true">
            <Icon name="icon-search" size={16} />
          </span>
        ) : null}
        <input
          {...restProps}
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClassName}
        />
        {canRenderClearButton && hasSearchText ? (
          <button
            type="button"
            className="wc-search-input__clear"
            title="Limpiar busqueda"
            aria-label="Limpiar busqueda"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={handleClear}
          >
            <Icon name="icon-x" size={14} />
          </button>
        ) : null}
      </div>

      {showSubmitButton ? (
        <WcButton
          variant="primary"
          className={`wc-search-input__submit ${submitButtonIconOnly ? "is-icon-only" : ""}`.trim()}
          onClick={onSubmit}
          disabled={disabled || submitButtonDisabled}
          aria-label={submitButtonIconOnly ? submitButtonLabel : undefined}
          title={submitButtonIconOnly ? submitButtonLabel : undefined}
        >
          {showSubmitIcon && submitButtonIconOnly ? (
            <Icon name="icon-search" size={13} />
          ) : null}
          {!submitButtonIconOnly ? submitButtonLabel : null}
        </WcButton>
      ) : null}
    </div>
  );
}

export default WcSearchInput;
