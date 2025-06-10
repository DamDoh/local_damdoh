// src/app/shops/[shopId]/page.tsx
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getShopById, getProductsByShopId } from '@/lib/firebase'; // Import the new function

import ProductCard from '@/components/marketplace/ProductCard'; // Import ProductCard
interface Shop {
  id: string;
  sellerId: string;
  sellerType: 'farmer' | 'agro-input-supplier' | 'service-provider' | 'processor';
  name: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  products?: string[]; // This might be deprecated if we query products collection directly
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function ShopPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // State for products
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopData = await getShopById(shopId);
        setShop(shopData as Shop);
      } catch (error) {
        console.error("Error fetching shop:", error);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (shopId) {
        try {
          const productsData = await getProductsByShopId(shopId);
          setProducts(productsData as Product[]);
        } catch (error) {
          console.error("Error fetching products:", error);
          setProducts([]);
        } finally {
          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();
  }, [shopId]);


  if (loading || loadingProducts) {
    return <div>Loading...</div>;
  }

  if (!shop) {
    return <div>Shop not found.</div>;
  }

  return (
    <div>
      {shop.bannerUrl && (
        <img src={shop.bannerUrl} alt={`${shop.name} banner`} className="w-full h-48 object-cover" />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          {shop.logoUrl && (
            <img src={shop.logoUrl} alt={`${shop.name} logo`} className="w-16 h-16 rounded-full mr-4" />
          )}
          <h1>{shop.name}</h1>
        </div>
        <p>{shop.description}</p>

        {/* Display contact information - Placeholder */}
        <div className="mt-8">
            <h2>Contact Information</h2>
            {shop.contact.email && <p>Email: {shop.contact.email}</p>}
            {shop.contact.phone && <p>Phone: {shop.contact.phone}</p>}
            {shop.contact.website && <p>Website: <a href={shop.contact.website} target="_blank" rel="noopener noreferrer">{shop.contact.website}</a></p>}
        </div>


        {/* Display products/services */}
        <div className="mt-8">
          <h2>Products and Services</h2>
          {products.length > 0 ? (
            <ul>
              {products.map((product) => (
 <ProductCard key={product.id} product={product} />
              ))}
            </ul>
          ) : (
            <p>No products or services listed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}