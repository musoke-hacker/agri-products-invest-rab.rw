import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'agri-invest-secure-secret-2024';

export interface AuthUser {
  id: string;
  phone: string;
  role: string;
}

export async function createToken(payload: AuthUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
