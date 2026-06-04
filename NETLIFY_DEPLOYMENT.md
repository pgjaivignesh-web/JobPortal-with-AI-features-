# Netlify Build Configuration

This project is configured for deployment on Netlify.

## Deploy Steps

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign up / log in
3. Click "New site from Git"
4. Connect your GitHub repository
5. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Netlify Site Settings > Build & Deploy > Environment:
   - `VITE_SUPABASE_URL` — Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key

7. Deploy! Netlify will automatically build and deploy on every push

## Edge Functions

Supabase Edge Functions are automatically deployed to Supabase (not Netlify). The Netlify build process will detect the `supabase/functions` directory and include it in the deployment metadata.

To use Edge Functions, ensure your Supabase project is configured with the credentials in your environment variables.

## Local Development

Run `npm run dev` to start the Vite dev server locally.
