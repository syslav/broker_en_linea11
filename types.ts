
export enum UserRole {
  PUBLIC = 'PUBLIC',
  OWNER = 'OWNER',
  INTERNAL_AGENT = 'INTERNAL_AGENT',
  EXTERNAL_AGENT = 'EXTERNAL_AGENT',
  BROKER = 'BROKER'
}

export interface PropertyStats {
  views: number;
  searchAppearances: number;
  contacts: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'PEN';
  durationDays: number;
  features: string[];
  isRecommended: boolean;
  color: string; // Hex color for visual styling
}

export interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyLocation: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  clientName: string;
  clientPhone?: string; // New field for private contact
  date: number; // Timestamp
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  evidenceImages?: string[]; // New field for photos (max 3)
}

export interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  propertyId: string;
  propertyTitle: string;
  createdAt: number; // Timestamp
  status: 'NEW' | 'CONTACTED';
  respondedBy?: string; // Agent ID who clicked the button
  respondedAt?: number; // Timestamp of response
  responseTimeMinutes?: number; // Calculated metric
  rating?: number; // 1-5 Star rating from client (Mocked)
}

export interface Notification {
  id: string;
  type: 'NEW_PROPERTY' | 'SHARED_COMMISSION' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  propertyId?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'PEN';
  location: string; // District, Department
  district?: string; // Stored separately for filtering
  type: 'SALE' | 'RENT';
  imageUrl: string; // Main image (First of images array)
  images: string[]; // Gallery images
  videoUrl?: string; // Nuevo campo para Video (Drive, YouTube, etc.)
  bedrooms: number;
  bathrooms: number;
  area: number; // m2
  
  petsPolicy: 'NO_PETS' | 'SMALL_PETS' | 'LARGE_PETS'; // Nuevo campo Mascotas

  // Ownership & Role Logic
  ownerId: string;
  ownerName: string;
  ownerDni?: string; // Nuevo campo para validación
  ownerPhone?: string; // Phone for contact
  
  // Status Flags
  isAgentSupport: boolean; // Owner asks for help
  agentSupportPercentage?: number; // Commission offered
  
  isSharedCommission: boolean; // External agent asks for help
  sharedCommissionPercentage?: number; // Nuevo campo: porcentaje compartido
  
  // Broker Management
  assignedAgentId?: string; // Internal agent assigned by broker
  managementStatus?: 'PENDING' | 'ASSIGNED' | 'REJECTED'; // Nuevo estado de gestión
  
  stats: PropertyStats;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  motivationThreshold?: number; // Minimum percentage required to accept a task/collaboration
  
  // Professional Profile
  phoneNumber?: string; // Contact for WhatsApp
  experience?: string; // e.g. "5 años"
  about?: string;
  dealStats?: {
    rented: number;
    sold: number;
  };
}

export interface SystemConfig {
  brandName: string;
  brandSubtitle: string;
  logoUrl: string; // URL for the navbar icon/logo
  faviconUrl: string;
  
  // Banner Config
  bannerImages: string[]; // Up to 3 images
  enableCarousel: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  
  // Property Config
  maxGalleryImages: number; // Configurable limit for property images

  // Lead Management
  centralWhatsAppNumber: string; // Number where client messages go initially
  leadHandlerAgentId?: string; // Agent assigned to handle incoming leads for the week

  // Social Media
  socialLinks: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
}
