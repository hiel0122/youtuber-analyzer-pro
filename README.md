# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c1dae0ee-3f85-4908-995e-e39e37178f0a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c1dae0ee-3f85-4908-995e-e39e37178f0a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c1dae0ee-3f85-4908-995e-e39e37178f0a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Environment Setup

### Frontend Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase Dashboard > Settings > API.

### Edge Function Secrets

This project uses Supabase Edge Functions that require certain secrets to be configured in your Supabase project.

**Required Secrets**

| Key name | Required | Note |
|----------|----------|------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key ([Get it here](https://console.cloud.google.com/apis/credentials)) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Service role key from Supabase Dashboard > Settings > API |
| `SERVICE_ROLE_KEY` | Yes* | Alternative name for above; code recognizes both |
| `SUPABASE_URL` | No | Auto-injected by Supabase runtime - **do not add to Secrets** |

*Only one of `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY` is needed.

### How to Add Secrets

1. Go to your Supabase Dashboard
2. Navigate to Project Settings > Edge Functions > Secrets
3. Add the required secrets listed above
4. **After adding secrets or modifying edge functions, you MUST redeploy:**
   - Via Dashboard: Functions > sync-new-videos > Redeploy
   - Via CLI: `supabase functions deploy sync-new-videos`

> **Note**: Edge functions are automatically deployed when you build your project in Lovable, but manual redeployment may be needed after secret changes.

### Testing the Edge Function

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-new-videos \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"channelKey": "https://www.youtube.com/@yourchannelname"}'
```

Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with your actual values from Supabase Dashboard.
