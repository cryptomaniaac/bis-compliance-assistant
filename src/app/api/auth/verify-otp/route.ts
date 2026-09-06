import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { setSessionCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and 6-digit code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Fetch OTP record from Supabase
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    const isExpired = new Date(otpRecord.expires_at).getTime() < Date.now();

    if (isExpired || otpRecord.code !== cleanCode) {
      // Increment attempt counter for security rate-limiting
      await supabaseAdmin
        .from('otp_codes')
        .update({ attempts: (otpRecord.attempts || 0) + 1 })
        .eq('id', otpRecord.id);

      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    // OTP Verified! Mark user as email_verified = true
    const { data: user, error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('email', normalizedEmail)
      .select('id, email, name')
      .single();

    if (userUpdateError || !user) {
      console.error('[Verify OTP DB User Error]:', userUpdateError);
      return NextResponse.json({ error: 'Failed to update user verification status.' }, { status: 500 });
    }

    // Delete used OTP record
    await supabaseAdmin.from('otp_codes').delete().eq('email', normalizedEmail);

    // Establish 7-day httpOnly session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Send welcome onboarding email (fires ONCE per user upon successful OTP verification)
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
    }).catch(err => {
      console.error('[Welcome Email Exception]:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('[Verify OTP API Error]:', error);
    return NextResponse.json({ error: error.message || 'OTP verification failed' }, { status: 500 });
  }
}
