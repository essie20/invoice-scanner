import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    
    // Check for authorization header for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting cleanup process...');

    // Calculate cutoff times
    const now = new Date();
    const anonymousCleanupTime = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago
    const userCleanupTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Get invoices to be deleted - anonymous users (15 minutes) and authenticated users (24 hours)
    const anonymousCleanupResult = await supabase
      .from('invoices')
      .select('id, user_id, image_url, created_at')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .lt('created_at', anonymousCleanupTime.toISOString());

    const userCleanupResult = await supabase
      .from('invoices')
      .select('id, user_id, image_url, created_at')
      .neq('user_id', '00000000-0000-0000-0000-000000000000')
      .lt('created_at', userCleanupTime.toISOString());

    if (anonymousCleanupResult.error) {
      console.error('Error fetching anonymous invoices for cleanup:', anonymousCleanupResult.error);
      return NextResponse.json({ error: 'Failed to fetch anonymous invoices' }, { status: 500 });
    }

    if (userCleanupResult.error) {
      console.error('Error fetching user invoices for cleanup:', userCleanupResult.error);
      return NextResponse.json({ error: 'Failed to fetch user invoices' }, { status: 500 });
    }

    const invoicesToDelete: Array<{
      id: string;
      user_id: string;
      image_url: string | null;
      created_at: string;
    }> = [
      ...(anonymousCleanupResult.data || []),
      ...(userCleanupResult.data || [])
    ];

    console.log(`Found ${invoicesToDelete?.length || 0} invoices to delete`);

    if (!invoicesToDelete || invoicesToDelete.length === 0) {
      return NextResponse.json({ 
        message: 'Cleanup completed', 
        deleted: { invoices: 0, images: 0 } 
      });
    }

    let deletedImages = 0;
    let deletedInvoices = 0;

    // Delete associated images from storage
    for (const invoice of invoicesToDelete) {
      if (invoice.image_url) {
        try {
          const { error: storageError } = await supabase.storage
            .from('invoice-images')
            .remove([invoice.image_url]);
          
          if (storageError) {
            console.error(`Failed to delete image ${invoice.image_url}:`, storageError);
          } else {
            deletedImages++;
            console.log(`Deleted image: ${invoice.image_url}`);
          }
        } catch (error) {
          console.error(`Error deleting image ${invoice.image_url}:`, error);
        }
      }
    }

    // Delete invoices (this will cascade delete invoice_items due to foreign key constraints)
    const invoiceIds = invoicesToDelete.map(inv => inv.id);
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .in('id', invoiceIds);

    if (deleteError) {
      console.error('Error deleting invoices:', deleteError);
      return NextResponse.json({ error: 'Failed to delete invoices' }, { status: 500 });
    }

    deletedInvoices = invoiceIds.length;
    console.log(`Deleted ${deletedInvoices} invoices and ${deletedImages} images`);

    return NextResponse.json({ 
      message: 'Cleanup completed successfully',
      deleted: { 
        invoices: deletedInvoices, 
        images: deletedImages 
      },
      cutoffTimes: {
        anonymous: anonymousCleanupTime.toISOString(),
        authenticated: userCleanupTime.toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Cleanup failed' 
    }, { status: 500 });
  }
}

// Manual cleanup endpoint for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method to trigger cleanup',
    info: 'Anonymous user data expires after 15 minutes, authenticated user data after 24 hours'
  });
}