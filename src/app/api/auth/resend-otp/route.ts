import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateNumericOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check user record
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, email_verified')
      .eq('email', normalizedEmail)
      .single();

    if (!user) {
      // Don't disclose non-existent accounts for security
      return NextResponse.json({ success: true, message: 'If an account exists, a new code has been sent.' });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: 'Your email is already verified. Please log in.' }, { status: 400 });
    }

    // Rate-limiting check (45 seconds cooldown)
    const { data: existingOtp } = await supabaseAdmin
      .from('otp_codes')
      .select('last_sent_at')
      .eq('email', normalizedEmail)
      .single();

    if (existingOtp && existingOtp.last_sent_at) {
      const secondsSinceLastSent = (Date.now() - new Date(existingOtp.last_sent_at).getTime()) / 1000;
      if (secondsSinceLastSent < 45) {
        const remaining = Math.ceil(45 - secondsSinceLastSent);
        return NextResponse.json({ error: `Please wait ${remaining} seconds before requesting another code.` }, { status: 429 });
      }
    }

    // Generate fresh OTP code
    const otpCode = generateNumericOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();

    await supabaseAdmin.from('otp_codes').delete().eq('email', normalizedEmail);

    const { error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        email: normalizedEmail,
        code: otpCode,
        expires_at: expiresAt,
        attempts: 0,
        last_sent_at: nowIso,
      });

    if (otpError) {
      console.error('[Resend OTP DB Error]:', otpError);
      return NextResponse.json({ error: 'Failed to generate new code.' }, { status: 500 });
    }

    // Send email via Resend
    const emailResult = await sendOTPEmail({
      to: normalizedEmail,
      name: user.name || 'User',
      code: otpCode,
      type: 'verification',
    });

    return NextResponse.json({
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error('[Resend OTP API Error]:', error);
    return NextResponse.json({ error: error.message || 'Resend code failed' }, { status: 500 });
  }
}
