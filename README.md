# Vault Dashboard

A modern, secure dashboard for managing files, links, and notes.

## Deployment on Vercel

This project is optimized for deployment on Vercel. Follow these steps:

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **Import to Vercel**: Connect your GitHub repository to Vercel.
3.  **Configure Project Settings**:
    *   **Root Directory**: `vault-dashboard`
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist/public`
4.  **Configure Environment Variables**: In the Vercel dashboard, add the following environment variables (refer to `.env.example`):

The `vercel.json` file included in this project handles SPA routing, ensuring that all routes are correctly served by `index.html`.

## Tech Stack

*   **Frontend**: React (Vite)
*   **Routing**: Wouter
*   **Styling**: Tailwind CSS
*   **Backend**: Supabase
*   **Icons**: Lucide React & Custom SVG Logo
