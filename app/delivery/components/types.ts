export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  shopName: string;
  areaName: string | null;
  shopMobile: string;
  totalAmount: number;
  createdAt: string | Date | null;
  items: OrderItem[];
}
