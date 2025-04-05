export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  cost: number;
  category_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  tax_id: string;
  tax_type: 'inclusive' | 'exclusive';
  unit_id: string;
  description: string;
  image_url?: string;
  status: 'available' | 'unavailable';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyalty_points?: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer?: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface POSSettings {
  enable_customer_profiles: boolean;
  enable_inventory_tracking: boolean;
  enable_employee_time_tracking: boolean;
  enable_discounts: boolean;
  enable_loyalty_program: boolean;
  enable_multi_currency: boolean;
  enable_offline_mode: boolean;
  enable_receipt_printing: boolean;
  enable_email_receipts: boolean;
  enable_sms_notifications: boolean;
  default_tax_rate: number;
  default_currency: string;
  receipt_footer: string;
  receipt_header: string;
}

export interface POSState {
  cart: CartItem[];
  customer: Customer | null;
  payment: Payment | null;
  settings: POSSettings;
  products: Product[];
  searchQuery: string;
  selectedCategory: string | null;
  isOffline: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'mobile' | 'bank_transfer';
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ReportData {
  date: string;
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  average_order_value: number;
  top_selling_products: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  top_customers: Array<{
    id: string;
    name: string;
    total_spent: number;
    total_orders: number;
  }>;
  sales_by_category: Array<{
    category: string;
    sales: number;
  }>;
  sales_by_hour: Array<{
    hour: string;
    sales: number;
  }>;
  sales_by_day: Array<{
    day: string;
    sales: number;
  }>;
} 