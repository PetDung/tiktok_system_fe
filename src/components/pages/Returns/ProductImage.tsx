import React from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/service/types/ApiResponse';


interface ProductImageProps {
  image: ProductImage;
  productName: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  image, 
  productName, 
  className = "w-16 h-16" 
}) => {
  return (
    <div className={`relative ${className} bg-gray-100 rounded-lg overflow-hidden`}>
      <img
        src={image.url}
        alt={productName}
        className="object-cover"
      />
    </div>
  );
};

export default ProductImage;
