import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Create admin client for server-side operations
    const supabase = createSupabaseAdmin();
    
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

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id,
        company,
        customer_name,
        invoice_number,
        issue_date,
        due_date,
        total_due,
        currency,
        status,
        image_url,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    return NextResponse.json({ invoices: invoices || [] });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}