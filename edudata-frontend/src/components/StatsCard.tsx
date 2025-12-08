import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard = ({ title, value, description, icon: Icon, trend, trendUp }: StatsCardProps) => {
  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          {trend && (
            <p className={`mt-2 text-xs font-medium ${trendUp ? 'text-accent' : 'text-destructive'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
