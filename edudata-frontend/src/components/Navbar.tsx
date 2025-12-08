import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/services/i18n";

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
}

const Navbar = ({ isAuthenticated, userRole, userName, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">EduData</span>
              <span className="text-xs text-muted-foreground">{t("app.tagline")}</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  <span className="text-xs text-muted-foreground capitalize">{userRole} Dashboard</span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("common.logout")}
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  {t("common.login")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
