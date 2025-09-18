import Badge from '@/components/UI/BadgeProps';
import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'RETURN_OR_REFUND_REQUEST_COMPLETE':
        return 'success';
      case 'RETURN_OR_REFUND_REQUEST_CANCEL':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RETURN_OR_REFUND_REQUEST_COMPLETE':
        return 'Completed';
      case 'RETURN_OR_REFUND_REQUEST_CANCEL':
        return 'Cancelled';
      default:
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;