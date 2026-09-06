import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, generateNumericOTP } from '@/lib/auth';
import { sendOTPEmail, sendWelcomeEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email_verified')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser && existingUser.email_verified) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    let userId = existingUser?.id;

    if (!existingUser) {
      // Create new unverified user
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          name: name.trim(),
          email: normalizedEmail,
          password_hash: passwordHash,
          email_verified: false,
        })
        .select('id')
        .single();

      if (insertError || !newUser) {
        console.error('[Signup DB Insert Error]:', insertError);
        return NextResponse.json({ error: insertError?.message || 'Failed to create user account in database.' }, { status: 500 });
      }
      userId = newUser.id;
    } else {
      // Update existing unverified user with new password & name
      const { error: updateErr } = await supabaseAdmin
        .from('users')
        .update({
          name: name.trim(),
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateErr) {
        console.error('[Signup DB Update Error]:', updateErr);
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    }

    // Generate 6-digit OTP code (10-minute expiry)
    const otpCode = generateNumericOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete any old OTP for this email
    await supabaseAdmin.from('otp_codes').delete().eq('email', normalizedEmail);

    // Insert fresh OTP record
    const { error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        email: normalizedEmail,
        code: otpCode,
        expires_at: expiresAt,
        attempts: 0,
        last_sent_at: new Date().toISOString(),
      });

    if (otpError) {
      console.error('[OTP DB Error]:', otpError);
      return NextResponse.json({ error: otpError.message || 'Failed to generate verification code.' }, { status: 500 });
    }

    // 1. Send OTP verification email via Gmail SMTP
    const emailResult = await sendOTPEmail({
      to: normalizedEmail,
      name: name.trim(),
      code: otpCode,
      type: 'verification',
    });

    // 2. Immediately send Welcome Email introducing platform & founder mission
    sendWelcomeEmail({
      to: normalizedEmail,
      name: name.trim(),
    }).catch(err => console.error('[Welcome Email Error]:', err));

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email: normalizedEmail,
      message: 'Verification code sent to your email.',
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error('[Signup API Exception]:', error);
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
