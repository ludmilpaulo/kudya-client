export type PaymentMethodCode = string;

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'pending_verification'
  | 'paid'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'
  | 'rejected';

export type BankAccount = {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_bic: string;
  branch: string;
  branch_code: string;
  currency: string;
  payment_reference_instructions: string;
  additional_instructions: string;
};

export type AvailablePaymentMethod = {
  code: PaymentMethodCode;
  label: string;
  provider: string;
  available: boolean;
  requires_phone: boolean;
  requires_proof: boolean;
  bank_accounts?: BankAccount[];
};

export type PaymentConfiguration = {
  country: { id: number | null; code: string; name: string; currency?: string } | null;
  currency: string;
  min_amount: string;
  max_amount: string | null;
  default_method: PaymentMethodCode;
  manual_proof_required: boolean;
  methods: AvailablePaymentMethod[];
};

export type PaymentInitializeResponse = {
  payment_id: number;
  kudya_reference: string;
  authorization_url: string | null;
  provider: string;
  provider_reference: string;
  public_key: string | null;
  status: PaymentStatus;
  amount: string;
  currency: string;
  requires_action: string | null;
  customer_message: string | null;
  bank_account: BankAccount | null;
};

export type PaymentTransaction = {
  id: number;
  kudya_reference: string;
  status: PaymentStatus;
  rejection_reason: string;
  amount: string;
  currency: string;
};

export type PaymentError = {
  detail: string;
  code: string;
};
