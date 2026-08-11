export type ApplicationStatus = string;

export type PropertyApplicationListItem = {
  id: number;
  property_listing: number;
  property_title: string;
  property_city: string;
  status: ApplicationStatus;
  proposed_rent: string;
  currency: string;
  move_in_date: string | null;
  submitted_at: string | null;
  created_at: string;
};

export type ApplicationDocument = {
  id: number;
  document_type: string;
  status: "pending" | "verified" | "rejected";
  original_filename: string;
  rejection_reason: string;
  uploaded_at: string;
};

export type ApplicationRequirement = {
  id: number;
  document_type: string;
  is_required: boolean;
  label_en: string;
  label_pt: string;
  label_fr: string;
  label_es: string;
  sort_order: number;
};

export type ApplicationTimelineStep = {
  key: string;
  label: string;
  state: "done" | "current" | "pending";
  at: string | null;
  note?: string;
};

export type Lease = {
  id: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: string;
  deposit: string;
  currency: string;
  special_conditions: string;
  rendered_body: string;
  signatures: Array<{ id: number; role: string; is_signed: boolean; signature_name: string }>;
};

export type PropertyViewing = {
  id: number;
  scheduled_at: string;
  location: string;
  notes?: string;
  status: string;
  customer_note?: string;
};

export type PropertyApplication = {
  id: number;
  property_listing: number;
  property_title: string;
  status: ApplicationStatus;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  nationality: string;
  current_address: string;
  employment_status: string;
  occupation: string;
  move_in_date: string | null;
  rental_period_months: number | null;
  adults: number;
  children: number;
  has_pets: boolean;
  pet_details: string;
  additional_notes: string;
  preferred_lease_language: string;
  documents: ApplicationDocument[];
  requirements: ApplicationRequirement[];
  timeline: ApplicationTimelineStep[];
  leases: Lease[];
  viewings?: PropertyViewing[];
};
