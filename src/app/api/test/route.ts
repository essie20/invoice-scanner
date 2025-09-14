import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test Supabase connection
    const supabase = createSupabaseAdmin();
    
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if invoices table exists
    const { data: invoicesTest, error: invoicesError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1);
    
    // Test 2: Check if invoice_items table exists  
    const { data: itemsTest, error: itemsError } = await supabase
      .from('invoice_items')
      .select('id')
      .limit(1);
    
    // Test 3: Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // Test 4: Check if invoice-images bucket exists
    const invoiceBucket = buckets?.find(bucket => bucket.name === 'invoice-images');
    
    return NextResponse.json({
      tests: {
        invoicesTable: {
          exists: !invoicesError,
          error: invoicesError?.message,
          errorCode: invoicesError?.code
        },
        invoiceItemsTable: {
          exists: !itemsError,
          error: itemsError?.message,
          errorCode: itemsError?.code
        },
        storage: {
          success: !bucketsError,
          error: bucketsError?.message,
          buckets: buckets?.map(b => b.name),
          invoiceBucketExists: !!invoiceBucket
        }
      },
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY
      }
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Test failed',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}