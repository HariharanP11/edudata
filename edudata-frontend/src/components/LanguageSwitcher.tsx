import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/services/i18n";

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const { supportedLanguages, currentLanguage, switchLanguage } = useTranslation();

  return (
    <div className={className}>
      <Select value={currentLanguage.code} onValueChange={(val) => switchLanguage(val)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={currentLanguage.name} />
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.code.toUpperCase()})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
