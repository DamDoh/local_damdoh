// src/components/ProductCard.tsx
import React from 'react';

interface Product {
  id: string;
  shopId: string; // Reference to the shop
  name: string;
  description: string;
  category: string; // e.g., 'Fresh Produce', 'Agro-Inputs'
  price: number;
  unit: string; // e.g., 'kg', 'quintal', 'piece'
  images?: string[]; // URLs of product images
  location?: { // Optional, for geo-location of the product
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Add other relevant fields based on category
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px 0', borderRadius: '8px' }}>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p><strong>Price:</strong> {product.price} / {product.unit}</p>
      {/* We can add image display and other details later */}
    </div>
  );
};

export default ProductCard;