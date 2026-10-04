# Convex Setup Instructions

## Issue: Connection Timeout to Convex Servers

Your application cannot connect to Convex's cloud servers (104.18.14.131:443, 104.18.15.131:443). This is likely due to:
- Firewall blocking Convex specifically
- DNS resolution issues
- Proxy configuration

## Solution: Manual Configuration

### Step 1: Get Your Convex Deployment URL

1. Open your browser and go to: https://dashboard.convex.dev
2. Log in to your Convex account
3. Find your project (or create a new one)
4. Copy your deployment URL (it looks like: `https://your-project-name.convex.cloud`)

### Step 2: Configure .env.local

Open your `.env.local` file and add:

```env
CONVEX_DEPLOYMENT=https://your-project-name.convex.cloud
```

Replace `your-project-name` with your actual project name from the dashboard.

### Step 3: Generate Convex Types

Once configured, run:

```bash
npx convex codegen
```

### Step 4: Start Development

```bash
# Terminal 1: Start Convex dev
npx convex dev

# Terminal 2: Start Next.js
npm run dev
```

## Alternative: Check Network Issues

If you still can't connect, try:

1. **Test DNS resolution:**
   ```bash
   ping convex.dev
   ```

2. **Check if Cloudflare is blocked:**
   - Some corporate firewalls block Cloudflare IPs
   - Try from a different network (mobile hotspot)

3. **Check proxy settings:**
   - If you use a proxy, ensure Convex domains are whitelisted

## Form Changes Status

✅ The invoice form improvements are complete:
- Widened selection fields (client, quotation, status, template)
- Improved responsive layout
- Better readability with larger fonts
- Enhanced line items grid

These changes will work perfectly once Convex is connected.
