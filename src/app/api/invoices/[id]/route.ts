import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Create admin client for server-side operations
    const supabase = createSupabaseAdmin();
    
    // Await the params (Next.js 15+ requirement)
    const params = await context.params;
    const invoiceId = params?.id;
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    
    // For development: Get the same user ID logic as upload
    let userId = '00000000-0000-0000-0000-000000000000';
    
    try {
      const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (users && users.users && users.users.length > 0) {
        userId = users.users[0].id;
      }
    } catch (authError) {
      console.log('Using fallback user ID');
    }

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('Items fetch error:', itemsError);
      // Don't fail the request if items can't be fetched
    }

    return NextResponse.json({
      invoice,
      items: items || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}