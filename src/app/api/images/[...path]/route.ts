import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const supabase = createSupabaseAdmin();
    
    // Join the path array to get the full file path
    let filePath = Array.isArray(path) ? path.join('/') : path;
    
    // Handle legacy URLs - extract just the path part
    if (filePath.includes('supabase.co')) {
      // Extract path from full URL: .../invoice-images/user-id/file.jpg
      const urlParts = filePath.split('/invoice-images/');
      if (urlParts.length > 1) {
        filePath = urlParts[1];
      }
    }
    
    console.log('Processing file path:', filePath);
    
    // Generate a signed URL for the image (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('invoice-images')
      .createSignedUrl(filePath, 3600);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json({ error: 'Failed to access image' }, { status: 404 });
    }
    
    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);
    
  } catch (error) {
    console.error('Image access error:', error);
    return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
  }
}