export interface Customer {
  name: string;
  billing_address?: string;
  shipping_address?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceDetails {
  issue_date: string;
  invoice_number: string;
  due_date?: string;
  po_number?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate?: number;
}

export interface SalesTax {
  rate?: number;
  amount?: number;
}

export interface Discount {
  rate?: number;
  amount?: number;
  description?: string;
}

export interface Terms {
  payment_due?: string;
  payable_to?: string;
  late_fee?: string;
}

export interface Invoice {
  company: string;
  customer: Customer;
  details: InvoiceDetails;
  items: InvoiceItem[];
  subtotal: number;
  sales_tax?: SalesTax;
  discount?: Discount;
  total_due: number;
  terms?: Terms;
  signature?: string;
  purpose?: string;
  notes?: string;
  currency?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface InvoiceData {
  invoice: Invoice;
}

// Database types
export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          customer_name: string;
          customer_billing_address: string | null;
          customer_shipping_address: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          issue_date: string;
          invoice_number: string;
          due_date: string | null;
          po_number: string | null;
          subtotal: number;
          sales_tax_rate: number | null;
          sales_tax_amount: number | null;
          discount_rate: number | null;
          discount_amount: number | null;
          discount_description: string | null;
          total_due: number;
          payment_terms: string | null;
          payable_to: string | null;
          late_fee: string | null;
          signature: string | null;
          purpose: string | null;
          notes: string | null;
          currency: string | null;
          status: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          customer_name: string;
          customer_billing_address?: string | null;
          customer_shipping_address?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          issue_date: string;
          invoice_number: string;
          due_date?: string | null;
          po_number?: string | null;
          subtotal: number;
          sales_tax_rate?: number | null;
          sales_tax_amount?: number | null;
          discount_rate?: number | null;
          discount_amount?: number | null;
          discount_description?: string | null;
          total_due: number;
          payment_terms?: string | null;
          payable_to?: string | null;
          late_fee?: string | null;
          signature?: string | null;
          purpose?: string | null;
          notes?: string | null;
          currency?: string | null;
          status?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company?: string;
          customer_name?: string;
          customer_billing_address?: string | null;
          customer_shipping_address?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          issue_date?: string;
          invoice_number?: string;
          due_date?: string | null;
          po_number?: string | null;
          subtotal?: number;
          sales_tax_rate?: number | null;
          sales_tax_amount?: number | null;
          discount_rate?: number | null;
          discount_amount?: number | null;
          discount_description?: string | null;
          total_due?: number;
          payment_terms?: string | null;
          payable_to?: string | null;
          late_fee?: string | null;
          signature?: string | null;
          purpose?: string | null;
          notes?: string | null;
          currency?: string | null;
          status?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          tax_rate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          tax_rate?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          tax_rate?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}