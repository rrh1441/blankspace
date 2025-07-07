export interface PreviewImage {
  id: string;
  originalUrl: string;
  previewUrl: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface Order {
  id: string;
  userEmail: string;
  tier: 'digital' | 'printed';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageKeys: string[];
  createdAt: string;
  pdfUrl?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  features: string[];
  stripeProductId?: string;
}