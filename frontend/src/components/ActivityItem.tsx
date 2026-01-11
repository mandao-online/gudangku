import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { StockMovement } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  movement: StockMovement;
}

export function ActivityItem({ movement }: ActivityItemProps) {
  const isIn = movement.type === 'in';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        isIn ? "bg-success/10" : "bg-warning/10"
      )}>
        {isIn ? (
          <ArrowDownCircle className="w-5 h-5 text-success" />
        ) : (
          <ArrowUpCircle className="w-5 h-5 text-warning" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{movement.itemName}</p>
        <p className="text-sm text-muted-foreground">
          {isIn ? '+' : '-'}{movement.quantity} • {format(new Date(movement.timestamp), 'HH:mm', { locale: id })}
        </p>
      </div>
      <span className={cn(
        "text-sm font-semibold",
        isIn ? "text-success" : "text-warning"
      )}>
        {isIn ? 'Masuk' : 'Keluar'}
      </span>
    </div>
  );
}
