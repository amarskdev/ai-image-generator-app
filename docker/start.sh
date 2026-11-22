#!/usr/bin/env bash
set -e

php artisan storage:link || true

# Run database migrations
php artisan migrate --force

# Cache Laravel configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Apache and queue worker
exec /usr/bin/supervisord -n