import React from 'react';
import StatusBadge from './StatusBadge';
import ReturnLineItem from './ReturnLineItem';
import { Return } from '@/service/types/ApiResponse';
import Badge from '@/components/UI/BadgeProps';

interface ReturnCardProps {
  order: Return;
}

const ReturnCard: React.FC<ReturnCardProps> = ({ order }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReturnTypeVariant = (type: string) => {
    return type === 'REFUND' ? 'info' : 'warning';
  };

  const getRoleVariant = (role: string) => {
    return role === 'BUYER' ? 'secondary' : 'info';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <h3 className="text-sm font-semibold text-gray-900">
              {order.returnId} - {order.shopName}
            </h3>
            <StatusBadge status={order.returnStatus} />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Order: <a  target="_blank" className='text-blue-500 underline' href={`/order-all-shop?order_id=${order.orderId}`}>{order.orderId}</a></span>
            <span>•</span>
            <span>{formatDate(order.updateTime)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={getReturnTypeVariant(order.returnType)}>
            {order.returnType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          <Badge variant={getRoleVariant(order?.role || "")}>
            {order.role}
          </Badge>
          {order.arbitrationStatus && (
            <Badge variant="warning">
              {order.arbitrationStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          )}
          <span className="text-xl font-bold text-blue-600">
            Refund Total:   ${order.refundAmount?.refundTotal.toFixed(2)}
         </span>
        </div>

        {/* Return Reason */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Reason:</span> {order.returnReasonText}
          </p>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4 flex gap-2">
          {order.returnLineItems?.map((item) => (
            <ReturnLineItem key={item.returnLineItemId} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReturnCard;
