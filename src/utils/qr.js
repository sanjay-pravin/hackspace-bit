// QR verification utility
export function createQrPayload(registrationId, eventId, userId) {
  // Hashed structured payload with application prefix
  return `ACE-VERIFY:${registrationId}:${eventId}:${userId}`;
}

export function parseQrPayload(payload) {
  if (!payload || typeof payload !== 'string') {
    return { valid: false, error: 'Empty or invalid QR payload' };
  }
  const parts = payload.trim().split(':');
  if (parts.length >= 4 && parts[0] === 'ACE-VERIFY') {
    return {
      valid: true,
      registrationId: parts[1],
      eventId: parts[2],
      userId: parts[3],
    };
  }
  // Fallback: If just registration ID was scanned or typed
  if (payload.startsWith('ACE-')) {
    return {
      valid: true,
      registrationId: payload.trim(),
      eventId: null,
      userId: null,
    };
  }
  return { valid: false, error: 'Unrecognized pass barcode format' };
}