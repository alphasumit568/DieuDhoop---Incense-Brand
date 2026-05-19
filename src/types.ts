export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  stock: number;
  description: string;
  categories: string[];
  images: string[];
  variants?: ProductVariant[];
  averageRating: number;
  tags?: string[];
  createdAt?: any;
}

export interface ProductVariant {
  name: string;
  price: number;
  discountPrice?: number;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  wishlist: string[];
  avatar?: string;
}

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  recommends: boolean;
  createdAt: any;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantName?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discount: number;
  type: 'percent' | 'flat';
  minSpend?: number;
  expiresAt?: any;
  active: boolean;
}
