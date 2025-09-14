import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    
    // Just test basic connection without tables
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    return NextResponse.json({
      connectionWorks: !error,
      error: error?.message,
      hasUsers: data?.users?.length > 0
    });
    
  } catch (error) {
    return NextResponse.json({
      connectionWorks: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}