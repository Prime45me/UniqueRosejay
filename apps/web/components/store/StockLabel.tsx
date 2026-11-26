import { Icon } from '@/components/ui/Icon';
import { STOCK_LABEL } from '@/lib/store/format';
import type { StockStatus } from '@/lib/store/types';

/** Availability = colour + icon + words (never colour alone), per the design's status rule. */
export function StockLabel({ status }: { status: StockStatus }) {
  const style =
    status === 'in_stock'
      ? { color: 'text-status-positive', icon: 'check' as const }
      : status === 'low_stock'
        ? { color: 'text-status-pending', icon: 'clock' as const }
        : { color: 'text-status-negative', icon: 'close' as const };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-caption font-medium ${style.color}`}>
      <Icon name={style.icon} className="h-3.5 w-3.5 shrink-0" />
      {STOCK_LABEL[status]}
    </span>
  );
}
