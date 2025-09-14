'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  FileText, 
  Building, 
  User, 
  Calendar, 
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Edit,
  Download,
  Share,
  Trash2
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate: number | null;
}

interface Invoice {
  id: string;
  company: string;
  customer_name: string;
  customer_billing_address: string | null;
  customer_shipping_address: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  invoice_number: string;
  issue_date: string;
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
}

export default function InvoiceDetail() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

  const fetchInvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (!response.ok) {
        throw new Error('Invoice not found');
      }
      const data = await response.json();
      setInvoice(data.invoice);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    // Map currency symbols to ISO codes
    const currencyMap: { [key: string]: string } = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      'C$': 'CAD',
      'A$': 'AUD'
    };
    
    // If it's a symbol, map it to ISO code first
    if (currencyMap[currency]) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyMap[currency]
      }).format(amount);
    }
    
    // Clean and validate currency code
    let validCurrency = currency?.toUpperCase() || 'USD';
    
    // Validate it's a 3-letter ISO code
    if (!/^[A-Z]{3}$/.test(validCurrency)) {
      validCurrency = 'USD'; // Fallback to USD
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency
    }).format(amount);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    
    // If it's already a full URL, use our API endpoint to handle it
    if (imageUrl.startsWith('http')) {
      return `/api/images/${encodeURIComponent(imageUrl)}`;
    }
    
    // If it's just a path, use our API endpoint directly
    return `/api/images/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Invoice not found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {error || 'The invoice you are looking for does not exist.'}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Invoice #{invoice.invoice_number}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created on {formatDate(invoice.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                 {invoice.status?.toUpperCase() || 'DRAFT'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company & Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    From
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium">{invoice.company}</p>
                    {invoice.payable_to && invoice.payable_to !== invoice.company && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Payable to: {invoice.payable_to}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    To
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p className="font-medium">{invoice.customer_name}</p>
                    {invoice.customer_billing_address && (
                      <p className="flex items-start">
                        <MapPin className="h-3 w-3 mr-1 mt-1 text-gray-400 flex-shrink-0" />
                        {invoice.customer_billing_address}
                      </p>
                    )}
                    {invoice.customer_email && (
                      <p className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {invoice.customer_email}
                      </p>
                    )}
                    {invoice.customer_phone && (
                      <p className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {invoice.customer_phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Date</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(invoice.issue_date)}</p>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(invoice.due_date)}</p>
                    </div>
                  )}
                  {invoice.po_number && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Number</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{invoice.po_number}</p>
                    </div>
                  )}
                  {invoice.payment_terms && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Terms</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{invoice.payment_terms}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {item.description}
                          {item.tax_rate && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              Tax: {item.tax_rate}%
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                          {formatCurrency(item.unit_price, invoice.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">
                          {formatCurrency(item.total_price, invoice.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes and Additional Info */}
            {(invoice.purpose || invoice.notes || invoice.signature) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h2>
                <div className="space-y-4">
                  {invoice.purpose && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Purpose</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{invoice.purpose}</p>
                    </div>
                  )}
                  {invoice.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Notes</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.signature && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Signature</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{invoice.signature}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Image */}
          <div className="space-y-6">
            {/* Amount Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(invoice.subtotal, invoice.currency || 'USD')}
                  </span>
                </div>
                
                {invoice.discount_amount && invoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Discount {invoice.discount_rate && `(${invoice.discount_rate}%)`}
                      {invoice.discount_description && (
                        <span className="block text-xs text-gray-500">{invoice.discount_description}</span>
                      )}
                    </span>
                    <span className="text-sm text-red-600 dark:text-red-400">
                      -{formatCurrency(invoice.discount_amount, invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                
                {invoice.sales_tax_amount && invoice.sales_tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Tax {invoice.sales_tax_rate && `(${invoice.sales_tax_rate}%)`}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(invoice.sales_tax_amount, invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Total Due</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total_due, invoice.currency || 'USD')}
                    </span>
                  </div>
                </div>
              </div>

              {invoice.late_fee && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Late Fee:</strong> {invoice.late_fee}
                  </p>
                </div>
              )}
            </div>

            {/* Original Image */}
            {invoice.image_url && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Original Image</h2>
                <div className="relative">
                  <img
                    src={getImageUrl(invoice.image_url)}
                    alt="Original invoice"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div className="mt-4">
                  <a
                    href={getImageUrl(invoice.image_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View full size →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}