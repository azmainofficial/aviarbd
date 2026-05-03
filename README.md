# Laravel 10 + Next.js (Merged)

This project contains both **Laravel 10** and **Next.js** in the same root folder.

## Project Structure

- `app/`: Laravel PHP logic (Controllers, Models, etc.)
- `src/app/`: Next.js App Router (Frontend)
- `public/`: Shared public assets for both Laravel and Next.js
- `package.json`: Unified dependencies and scripts

## Connection Details

The frontend and backend are pre-connected:
- **Frontend API URL**: Set in `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:8000/api`)
- **Backend CORS**: Configured in `config/cors.php` to allow requests.
- **Test Route**: Available at `GET /api/test`.

## Getting Started

### Backend (Laravel)

1. Ensure you have PHP and Composer installed.
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Configure your environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Run the Laravel server:
   ```bash
   php artisan serve
   ```

### Frontend (Next.js)

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```

## Development Scripts

- `npm run dev`: Starts Next.js development server.
- `npm run laravel-dev`: Starts Laravel Vite server (if needed for blade views).
- `php artisan serve`: Starts Laravel backend API.
