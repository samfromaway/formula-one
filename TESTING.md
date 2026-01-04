# Testing the Notification Cron Job

## Method 1: Test Notification System (Quick Test)

This tests if push notifications are working with your subscriptions.

### Steps:
1. **First, subscribe to notifications** on your main page (click the subscribe button)
2. **Visit the test endpoint** in your browser or use curl:
   ```
   https://your-domain.vercel.app/api/test/notifications
   ```
   
   Or locally:
   ```
   http://localhost:3000/api/test/notifications
   ```

3. **Check the response** - it will show:
   - Redis connection status
   - Number of subscriptions
   - Number of notifications sent/failed
   - Detailed results for each subscription

## Method 2: Test the Cron Job Endpoint Directly

### Option A: Without CRON_SECRET (Easier for Testing)

If you haven't set `CRON_SECRET` in your environment variables, you can call it directly:

**Locally:**
```bash
curl http://localhost:3000/api/cron/notifications
```

**On Vercel:**
```bash
curl https://your-domain.vercel.app/api/cron/notifications
```

### Option B: With CRON_SECRET (More Secure)

If you have `CRON_SECRET` set, you need to include it in the header:

**Locally:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/notifications
```

**On Vercel:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.vercel.app/api/cron/notifications
```

## Method 3: Test Locally

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Make sure you have environment variables set** in `.env.local`:
   ```
   KV_REST_API_URL=your_redis_url
   KV_REST_API_TOKEN=your_redis_token
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   CRON_SECRET=your_secret (optional)
   ```

3. **Test the endpoints:**
   - Open `http://localhost:3000/api/test/notifications` in your browser
   - Or call `http://localhost:3000/api/cron/notifications` (with auth header if CRON_SECRET is set)

## Method 4: Test on Vercel After Deployment

1. **Deploy your changes to Vercel**

2. **Test the endpoints:**
   - Visit: `https://your-domain.vercel.app/api/test/notifications`
   - Or call the cron endpoint: `https://your-domain.vercel.app/api/cron/notifications`

3. **Check Vercel Function Logs:**
   - Go to your Vercel dashboard
   - Navigate to your project → Deployments → Select a deployment
   - Click on "Functions" tab to see logs

4. **Monitor Cron Job Execution:**
   - Go to your Vercel dashboard
   - Navigate to your project → Settings → Cron Jobs
   - You can see the execution history and logs

## Expected Responses

### Test Endpoint (`/api/test/notifications`):
```json
{
  "success": true,
  "message": "Test notifications sent",
  "subscriptionsCount": 1,
  "notificationsSent": 1,
  "notificationsFailed": 0,
  "details": [...]
}
```

### Cron Endpoint (`/api/cron/notifications`):
```json
{
  "success": true,
  "eventsFound": 2,
  "notificationsSent": 2,
  "notificationsSkipped": 0,
  "subscriptionsCount": 1
}
```

Or if no events:
```json
{
  "success": true,
  "message": "No events starting within the next 24 hours",
  "eventsChecked": 0
}
```

## Troubleshooting

- **No subscriptions found**: Make sure you've subscribed from the main page first
- **Redis connection failed**: Check your `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables
- **Unauthorized error**: If you set `CRON_SECRET`, make sure to include it in the Authorization header
- **No events found**: This is normal if there are no races in the next 24 hours

