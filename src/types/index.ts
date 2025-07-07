export interface PreviewImage {
  id: string;
  originalUrl: string;
  previewUrl: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface Order {
  id: string;
  userEmail: string;
  tier: 'basic' | 'premium' | 'deluxe';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageKeys: string[];
  createdAt: string;
  pdfUrl?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  maxPhotos: number;
  features: string[];
  stripeProductId: string;
}