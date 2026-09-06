import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user record from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_hash, email_verified')
      .eq('email', normalizedEmail)
      .single();

    // Generic response for non-existent user or database error
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify password hash
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Check if email has been verified via OTP
    if (!user.email_verified) {
      return NextResponse.json({
        requiresVerification: true,
        email: normalizedEmail,
        message: 'Your email address is not verified yet. Please enter your verification code.',
      }, { status: 403 });
    }

    // Create 7-day httpOnly session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('[Login API Error]:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
