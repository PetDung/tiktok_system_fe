import React from 'react';
import ProductImage from './ProductImage';
import type { ReturnLineItem } from '@/service/types/ApiResponse';
import ThumbPreview from '../Design/_components/ThumbPreview';

interface ReturnLineItemProps {
  item: ReturnLineItem;
}

const ReturnLineItem: React.FC<ReturnLineItemProps> = ({ item }) => {
  return (

    <ThumbPreview
        thumbUrl={item.productImage.url}
        fullImageUrl={item.productImage.url}
        size={60}
        alt={item.productName}

    />
  );
};

export default ReturnLineItem;