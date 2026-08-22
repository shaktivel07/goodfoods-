// src/lib/types.ts
// Shared TypeScript interfaces for the entire application

export interface Location {
  PK: string;
  SK: string;
  locationId: string;
  name: string;
  building: string;
  floor: string;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItem {
  PK: string;
  SK: string;
  itemId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  status: 'AVAILABLE' | 'HIDDEN';
  createdAt: string;
}

export interface UserProfile {
  PK: string;
  SK: string;
  email: string;
  name: string;
  phone: string;
  locationId: string;
  locationName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  PK: string;
  SK: string;
  GSI_PK: string;
  GSI_SK: string;
  orderId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  total: number;
  locationId: string;
  locationName: string;
  status: 'PENDING' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'UNCLAIMED' | 'CANCELLED';
  otp: string;
  paymentMethod: 'COD';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  dispatchedOrders: number;
  pendingDispatchOrders: number;
  unclaimedOrders: number;
  monthlyData: MonthlyData[];
  locationBreakdown: LocationBreakdown[];
}

export interface MonthlyData {
  month: string;
  orders: number;
  revenue: number;
}

export interface LocationBreakdown {
  locationName: string;
  orders: number;
  revenue: number;
}
