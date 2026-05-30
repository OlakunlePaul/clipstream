import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const emailSchema = z.string().email().trim().toLowerCase();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('countOnly')) {
    const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
    return NextResponse.json({ count: count || 847 }); // Fallback to 847 if null
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate email
    const parseResult = emailSchema.safeParse(body.email);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    const email = parseResult.data;

    // 2. Check for duplicate in Supabase
    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ alreadySubscribed: true, message: 'Email already exists' }, { status: 200 });
    }

    // 3. Insert into Supabase
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert([{ email, source: body.source || 'landing' }]);

    if (insertError) {
      console.error('Supabase error:', insertError);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    // 4. Send confirmation email (with automatic SMTP fallback)
    try {
      await sendEmail({
        to: email,
        subject: "You're on the ClipStream waitlist",
        text: "Hey — you're in. We're building ClipStream for developers who are tired of emailing themselves API keys. We'll email you when we're ready for beta. In the meantime, follow along on GitHub: https://github.com/OlakunlePaul/clipstream — the founders",
      });
    } catch (emailError) {
      console.error('Failed to send waitlist email:', emailError);
    }

    // Get updated total waitlist count
    const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

    return NextResponse.json({ success: true, count: count || 848 }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
