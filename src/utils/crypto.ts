export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`salt_freevideoai_${plainText}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `$sha256$${hashHex.slice(0, 32)}...`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '******@unknown.com';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

export function maskKey(key: string): string {
  if (!key || key.length <= 8) return '••••••••';
  return `${key.slice(0, 6)}••••••••••••••••${key.slice(-4)}`;
}
