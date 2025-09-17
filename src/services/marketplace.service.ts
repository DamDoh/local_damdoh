import { api, PaginationParams } from '../lib/api-client';

interface Listing {
  id: string;
  seller: string;
  type: 'PRODUCT' | 'SERVICE' | 'EQUIPMENT';
  title: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
    unit?: string;
  };
  quantity: {
    available: number;
    unit: string;
  };
  images: string[];
  location: {
    coordinates: [number, number];
  };
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'SUSPENDED';
}

interface Order {
  id: string;
  buyer: string;
  seller: string;
  listing: string;
  quantity: number;
  totalPrice: {
    amount: number;
    currency: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

interface SearchListingsParams extends PaginationParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: [number, number];
  radius?: number;
}

interface CreateOrderParams {
  listingId: string;
  quantity: number;
  shippingAddress: NonNullable<Order['shippingAddress']>;
}

export const marketplaceService = {
  // Listings
  searchListings: (params?: SearchListingsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.location) {
      searchParams.append('location', params.location.join(','));
    }
    if (params?.radius) searchParams.append('radius', params.radius.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);

    return api.get<{ data: Listing[]; pagination: any }>('/marketplace/listings', {
      params: searchParams,
    });
  },

  getListingsByUser: (userId: string, params?: PaginationParams) =>
    api.get<{ data: Listing[]; pagination: any }>(`/marketplace/listings/user/${userId}`, {
      params: new URLSearchParams(params as any),
    }),

  createListing: (data: Omit<Listing, 'id' | 'seller' | 'status'>) =>
    api.post<Listing>('/marketplace/listings', data),

  updateListing: (id: string, data: Partial<Listing>) =>
    api.put<Listing>(`/marketplace/listings/${id}`, data),

  deleteListing: (id: string) =>
    api.delete<void>(`/marketplace/listings/${id}`),

  // Orders
  createOrder: (data: CreateOrderParams) =>
    api.post<Order>('/marketplace/orders', data),

  getUserOrders: (userId: string, params?: PaginationParams & { role?: 'buyer' | 'seller' }) =>
    api.get<{ data: Order[]; pagination: any }>(`/marketplace/orders/user/${userId}`, {
      params: new URLSearchParams(params as any),
    }),

  updateOrderStatus: (orderId: string, status: Order['status']) =>
    api.patch<Order>(`/marketplace/orders/${orderId}/status`, { status }),
};