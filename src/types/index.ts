// Database Types for Tour Ops

export type UserRole = "Owner" | "Manager" | "Agent" | "TourManager" | "BusinessManager" | "Artist" | "Production" | "BandMember" | "Viewer";

export type ShowStatus = "Confirmed" | "Pending" | "Block" | "Hold" | "Off" | "Public Appearance" | "Tentative";

export type AttachmentType = "Contract" | "Offer" | "Rider" | "W9" | "Insurance" | "Settlement" | "Other";

export interface Organization {
  id: string;
  name: string;
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Artist {
  id: string;
  orgId: string;
  name: string;
  imageUrl?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    bannerImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Tour {
  id: string;
  orgId: string;
  artistId: string;
  name: string;
  dateStart: Date;
  dateEnd: Date;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Show {
  id: string;
  orgId: string;
  tourId: string;
  artistId: string;
  status: ShowStatus;
  date: Date;
  doorTime?: string;
  setTime?: string;
  curfew?: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  venue: {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    capacity?: number;
  };
  financials: {
    guarantee?: number;
    bonus?: string;
    dealNotes?: string;
    currency: string;
  };
  buyer?: {
    company: string;
    officeAddress?: string;
    signatoryName?: string;
    signatoryPhone?: string;
    signatoryEmail?: string;
  };
  production: Array<{
    role: string;
    name: string;
    phone?: string;
    email?: string;
  }>;
  attachments: Attachment[];
  travel?: {
    hotel?: string;
    flights?: string;
    ground?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  filePath: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Contact {
  id: string;
  orgId: string;
  organization: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  orgId: string;
  displayName: string;
  email: string;
  role: UserRole;
  artistAccess?: string[]; // Array of artist IDs they can access
  createdAt: Date;
  updatedAt: Date;
}
