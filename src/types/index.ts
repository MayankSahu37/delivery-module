
export type OrderStatus = 'paid' | 'PENDING_DELIVERY' | 'ACCEPTED_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export interface Order {
  id: string;
  total_price: number;
  delivery_address: string;
  status: OrderStatus;
  created_at: string;
  // Join fields
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  // medicine name often comes from joined medicine table, keeping simple for now
  medicine_name?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  address: string | null;
  vehicle_number: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
  stats?: AgentStats;
}

export interface AgentStats {
  totalAccepted: number;
  totalDelivered: number;
  activeDeliveries: number;
  ignoredCount?: number;
}

export interface OrderDeliveryAssignment {
  id: string;
  order_id: string;
  delivery_boy_id: string;
  assigned_at: string;
}
