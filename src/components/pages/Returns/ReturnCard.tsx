import React from 'react';
import StatusBadge from './StatusBadge';
import ReturnLineItem from './ReturnLineItem';
import { Return } from '@/service/types/ApiResponse';
import Badge from '@/components/UI/BadgeProps';

interface ReturnCardProps {
  order: Return;
}

const ReturnCard: React.FC<ReturnCardProps> = ({ order }) => {
  const {
    returnId,
    shopName,
    returnStatus,
    orderId,
    updateTime,
    returnType,
    role,
    arbitrationStatus,
    refundAmount,
    returnLineItems,
    returnReasonText,
    createTime
  } = order;

  const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // giờ 24h
    timeZone: 'Asia/Ho_Chi_Minh' // đảm bảo múi giờ VN
  });

  const formatText = (text?: string) =>
    text
      ? text.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
      : '';

  const returnTypeVariant = returnType === 'REFUND' ? 'info' : 'warning';
  const roleVariant = role === 'BUYER' ? 'secondary' : 'info';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Return / Shop</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Items</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Refund</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="bg-white">
            <td className="px-4 py-2 font-semibold text-gray-900">
              {returnId} - {shopName}
              <div className="text-gray-500 text-xs mt-1">
                Order:{' '}
                <a
                  target="_blank"
                  className="text-blue-500 underline"
                  href={`/order-all-shop?order_id=${orderId}`}
                >
                  {orderId}
                </a>
              </div>
            </td>
            <td className="px-4 py-2 w-68">
              <StatusBadge status={returnStatus} />
              <div className="mt-1 space-x-1">
                <Badge variant={returnTypeVariant}>{formatText(returnType)}</Badge>
                <Badge variant={roleVariant}>{role}</Badge>
                {arbitrationStatus && <Badge variant="warning">{formatText(arbitrationStatus)}</Badge>}
              </div>
            </td>
            <td className="px-4 py-2 w-48">
              {returnLineItems?.map(item => (
                <ReturnLineItem key={item.returnLineItemId} item={item} />
              ))}
            </td>
            <td className="px-4 py-2 font-medium text-blue-600">
              ${refundAmount?.refundTotal.toFixed(2)}
            </td>
            <td className="px-4 py-2 text-gray-500">
            <span className='block'>Gần nhất: {formatDate(updateTime)}</span>
            <span> Ngày tạo: {formatDate(createTime)}</span>
            </td>
          </tr>
          <tr className="bg-gray-50">
            <td colSpan={5} className="px-4 py-2 text-gray-600 text-sm">
              <span className="font-medium">Reason:</span> {returnReasonText}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReturnCard;
