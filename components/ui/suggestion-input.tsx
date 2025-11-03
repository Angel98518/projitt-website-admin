import { useState, useRef, useEffect } from "react";
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SuggestionInput Component
 * 
 * A dropdown input component that allows the user to type and select suggestions.
 * Filters the suggestion list based on user input and allows selection to update the parent.
 * Useful for designation or tag selection.
 */

interface Suggestion {
  id: string;
  name: string;
}

export default function SuggestionInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Select Designation",
  disabled = false
}: {
  value: string;
  onChange: (val: string) => void;
  suggestions: Suggestion[];
  placeholder?: string;
  disabled?: boolean;
}) {
  /**
   * Component state for input value and dropdown visibility.
   */
  const [inputValue, setInputValue] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Sync internal state with external value prop
   */
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  /**
   * Filters the list of suggestions based on input value (case insensitive),
   * excludes the exact match from showing again.
   */
  const filteredSuggestions = suggestions
    .filter(
      (s) =>
        s.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        s.name !== inputValue
    );

  /**
   * Handles selection from dropdown:
   * Sets the selected name to the input and calls the parent `onChange` handler.
   */
  const handleSelect = (name: string) => {
    if (disabled) return;
    setInputValue(name);
    onChange(name);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          id="suggestion-input"
          data-testid="suggestion-input"
          className={cn(
            "h-[48px] w-full border border-[#bcbcbc] rounded-[10px] px-3 pr-10 outline-none text-gray-700",
            "focus-visible:border-[#0D978B] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0D978B]/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10"
          )}
          value={inputValue}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          onFocus={() => !disabled && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
          onChange={e => {
            if (!disabled) {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {showDropdown ? (
            <ChevronUp className="h-4 w-4 opacity-60" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-60" />
          )}
        </div>
      </div>
      {showDropdown && !disabled && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full">
          <div className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover shadow-md shadow-black/5 text-secondary-foreground">
            <div className="p-1.5 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((s) => (
                <div
                  key={s.id}
                  id={`suggestion-item-${s.id}`}
                  data-testid={`suggestion-item-${s.id}`}
                  onMouseDown={() => handleSelect(s.name)}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-hidden text-foreground hover:bg-[#EBFFF7] focus:bg-[#EBFFF7] data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  {s.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
