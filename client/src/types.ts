export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  products: number;
  location: string;
  image: string;
  featured: boolean;
  ownerId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  shopId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  userId: string;
  shopId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
