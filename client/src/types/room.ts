export interface Room {
  _id: string;
  name: string;
  description: string;
  weekday_price: number;
  weekend_price: number;
  weekday_discount_price?: number;
  weekend_discount_price?: number;
  price_reduction_per_bedroom?: number;
  capacity: number;
  bedrooms: number;
  min_bedrooms?: number;
  image_url: string;
  images?: string[];
  features: string[];
  available?: boolean;
}
