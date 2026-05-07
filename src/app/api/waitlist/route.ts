import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // 1. Check for duplicate in Supabase
    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    // 2. Insert into Supabase
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert([{ email }]);

    if (insertError) {
      console.error('Supabase error:', insertError);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    // 3. Send confirmation via Resend
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: 'Welcome to the ClipStream Waitlist!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #2563eb;">Welcome to ClipStream!</h1>
            <p>Thanks for joining our waitlist. We're excited to have you on board!</p>
            <p>ClipStream is currently in private beta, and we'll be rolling out access in stages. You'll receive another email as soon as we're ready for you to start bridging your devices.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });
    } catch (emailError) {
      // We don't fail the request if the email fails, but we log it
      console.error('Resend error:', emailError);
    }

    return NextResponse.json({ message: 'Joined waitlist successfully' }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
