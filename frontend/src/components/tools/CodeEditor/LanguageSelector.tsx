import React from "react";
import { CaretDownIcon } from "../../Icons";
import { SUPPORTED_LANGUAGES } from "./constants";
import useDropdown from "./useDropdown";

interface LanguageSelectorProps {
  currentLanguage: string;
  onChange: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onChange,
}) => {
  const {
    isOpen: showLanguageDropdown,
    ref: languageDropdownRef,
    toggle: toggleLanguageDropdown,
    close: closeLanguageDropdown,
  } = useDropdown();

  return (
    <div className="language-selector">
      <button className="language-button" onClick={toggleLanguageDropdown}>
        {currentLanguage || "Select Language"}
        <CaretDownIcon />
      </button>
      {showLanguageDropdown && (
        <div className="language-dropdown" ref={languageDropdownRef}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div
              key={lang.value}
              className="language-option"
              onClick={() => {
                onChange(lang.value);
                closeLanguageDropdown();
              }}
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
