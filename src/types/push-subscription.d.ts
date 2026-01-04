// Type definition for PushSubscription used in server-side code
// This matches the structure expected by web-push library
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

