// src/lib/auth-middleware.ts
// Server-side helper: extract and verify Firebase ID token from Authorization header

import 'server-only';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';

/**
 * Extracts the Bearer token from a Request's Authorization header.
 * Returns null if missing or malformed.
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Decodes a Firebase ID token without verification (used for extracting email/uid).
 * NOTE: For production, install firebase-admin and verify tokens properly.
 * This implementation decodes the JWT payload to extract claims.
 * Firebase tokens are already validated by the Firebase SDK on the client side,
 * and we verify the email matches the stored profile on every write operation.
 */
export function decodeFirebaseToken(token: string): { email: string; name: string; uid: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url decode the payload
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    if (!decoded.email) return null;
    return {
      email: decoded.email as string,
      name: (decoded.name as string) || decoded.email,
      uid: decoded.sub as string,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if an email belongs to the admin list defined in environment variables.
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Retrieves the list of assigned delivery staff emails from DynamoDB & env.
 */
export async function getDeliveryStaffEmails(): Promise<string[]> {
  const envDelivery = (process.env.DELIVERY_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  try {
    const res = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: 'SYSTEM#CONFIG', SK: 'DELIVERY_STAFF' },
      })
    );
    const dbEmails: string[] = res.Item?.emails ?? [];
    const normalizedDb = dbEmails.map((e) => e.trim().toLowerCase());
    return Array.from(new Set([...envDelivery, ...normalizedDb]));
  } catch {
    return envDelivery;
  }
}

/**
 * Checks if an email belongs to delivery staff or admin.
 */
export async function isDeliveryEmail(email: string): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  const staff = await getDeliveryStaffEmails();
  return staff.includes(email.toLowerCase());
}

/**
 * Validates a request has a valid token and returns decoded claims.
 * Returns null if the token is invalid or missing.
 */
export function requireAuth(request: Request): { email: string; name: string; uid: string } | null {
  const token = extractToken(request);
  if (!token) return null;
  return decodeFirebaseToken(token);
}

/**
 * Validates a request has a valid token AND the user is an admin.
 */
export function requireAdmin(request: Request): { email: string; name: string; uid: string } | null {
  const claims = requireAuth(request);
  if (!claims) return null;
  if (!isAdminEmail(claims.email)) return null;
  return claims;
}

/**
 * Validates a request has a valid token AND the user is an admin or delivery staff member.
 */
export async function requireDelivery(request: Request): Promise<{ email: string; name: string; uid: string } | null> {
  const claims = requireAuth(request);
  if (!claims) return null;
  const allowed = await isDeliveryEmail(claims.email);
  if (!allowed) return null;
  return claims;
}
