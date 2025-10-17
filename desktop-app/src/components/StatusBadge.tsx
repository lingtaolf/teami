import { Activity, CheckCircle2, Clock, AlertCircle, CalendarClock } from 'lucide-react';
import { Badge } from './ui/badge';
import type { ProjectStatus } from '../constants';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // 暂时只处理READY状态，其他状态显示为默认样式
  if (status === 'READY') {
    return (
      <Badge className="bg-gradient-to-r from-blue-400 to-blue-500 border-0 text-white shadow-md">
        <Clock className="mr-1 h-3 w-3" />
        Ready
      </Badge>
    );
  }
  
  // 其他状态的映射 (为未来扩展预留)
  const statusConfig = getStatusConfig(status);
  const Icon = statusConfig.icon;
  
  return (
    <Badge variant="secondary" className="text-slate-600">
      <Icon className="mr-1 h-3 w-3" />
      {statusConfig.label}
    </Badge>
  );
}

function getStatusConfig(status: string) {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
      return {
        icon: Activity,
        label: 'Active',
        className: 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-white shadow-md'
      };
    case 'completed':
      return {
        icon: CheckCircle2,
        label: 'Completed',
        className: 'bg-gradient-to-r from-purple-500 to-pink-600 border-0 text-white shadow-md'
      };
    case 'planning':
      return {
        icon: CalendarClock,
        label: 'Planning',
        className: 'bg-gradient-to-r from-orange-400 to-amber-500 border-0 text-white shadow-md'
      };
    default:
      return {
        icon: AlertCircle,
        label: status || 'Unknown',
        className: 'bg-slate-500 border-0 text-white'
      };
  }
}