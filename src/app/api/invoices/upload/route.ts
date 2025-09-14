/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';
import { extractInvoiceData } from '@/lib/gemini';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Upload API called ===');
    
    // Create admin client for server-side operations
    const supabase = createSupabaseAdmin();
    console.log('Supabase admin client created');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('File received:', file ? { name: file.name, size: file.size, type: file.type } : 'No file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // For development: Get or create a dummy user
    let userId = '00000000-0000-0000-0000-000000000000';
    
    // Try to get existing users or create one
    try {
      const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      
      if (users && users.users && users.users.length > 0) {
        // Use the first existing user
        userId = users.users[0].id;
        console.log('Using existing user:', userId);
      } else {
        // Create a new dummy user
        const { data: newUser } = await supabase.auth.admin.createUser({
          email: 'dummy@example.com',
          password: 'dummy-password-123',
          email_confirm: true
        });
        
        if (newUser.user) {
          userId = newUser.user.id;
          console.log('Created new dummy user:', userId);
        }
      }
    } catch (authError: any) {
      console.log('Auth handling note:', authError.message);
      // Fallback: we'll handle the foreign key error gracefully below
    }

    // Convert file to base64 for Gemini API
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Extract invoice data using Gemini AI
    console.log('Extracting invoice data with Gemini AI...');
    const invoiceData = await extractInvoiceData(base64, file.type);
    console.log('Invoice data extracted:', invoiceData);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`;

    // Ensure the invoice-images bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'invoice-images');
    
    if (!bucketExists) {
      console.log('Creating invoice-images bucket...');
      const { error: bucketError } = await supabase.storage.createBucket('invoice-images', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (bucketError) {
        console.error('Failed to create bucket:', bucketError);
        return NextResponse.json({ error: 'Failed to setup storage' }, { status: 500 });
      }
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoice-images')
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error details:', {
        message: uploadError.message,
        error: uploadError
      });
      return NextResponse.json({ 
        error: 'Failed to upload file', 
        details: uploadError.message 
      }, { status: 500 });
    }

    // Store the file path (not the full URL) for security
    const imagePath = fileName;

    // Insert invoice data into database
    console.log('Starting database insert...');
    const invoice = invoiceData.invoice;
    console.log('Invoice data to insert:', {
      company: invoice.company,
      customer_name: invoice.customer.name,
      invoice_number: invoice.details.invoice_number,
      total_due: invoice.total_due
    });
    
    // Prepare invoice data for insertion
    const invoiceInsertData: Database['public']['Tables']['invoices']['Insert'] = {
      user_id: userId,
      company: invoice.company,
      customer_name: invoice.customer.name,
      customer_billing_address: invoice.customer.billing_address || null,
      customer_shipping_address: invoice.customer.shipping_address || null,
      customer_email: invoice.customer.email || null,
      customer_phone: invoice.customer.phone || null,
      issue_date: invoice.details.issue_date,
      invoice_number: invoice.details.invoice_number,
      due_date: invoice.details.due_date || null,
      po_number: invoice.details.po_number || null,
      subtotal: invoice.subtotal,
      sales_tax_rate: invoice.sales_tax?.rate || null,
      sales_tax_amount: invoice.sales_tax?.amount || null,
      discount_rate: invoice.discount?.rate || null,
      discount_amount: invoice.discount?.amount || null,
      discount_description: invoice.discount?.description || null,
      total_due: invoice.total_due,
      payment_terms: invoice.terms?.payment_due || null,
      payable_to: invoice.terms?.payable_to || null,
      late_fee: invoice.terms?.late_fee || null,
      signature: invoice.signature || null,
      purpose: invoice.purpose || null,
      notes: invoice.notes || null,
      currency: invoice.currency || 'USD',
      status: invoice.status || 'draft',
      image_url: imagePath,
    };
    
    const { data: invoiceRecord, error: insertError } = await (supabase as any)
      .from('invoices')
      .insert(invoiceInsertData)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        error: insertError
      });
      return NextResponse.json({ 
        error: 'Failed to save invoice data',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }
    
    console.log('Invoice record created:', invoiceRecord?.id);

    // Insert invoice items
    if (invoice.items && invoice.items.length > 0) {
      const items: Database['public']['Tables']['invoice_items']['Insert'][] = invoice.items.map(item => ({
        invoice_id: invoiceRecord!.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        tax_rate: item.tax_rate || null,
      }));

      const { error: itemsError } = await (supabase as any)
        .from('invoice_items')
        .insert(items);

      if (itemsError) {
        console.error('Items insert error:', itemsError);
        // Note: We don't return an error here since the main invoice was saved
      }
    }

    return NextResponse.json({
      success: true,
      id: invoiceRecord!.id,
      message: 'Invoice processed successfully',
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}