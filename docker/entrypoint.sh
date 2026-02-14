#!/bin/sh
set -e

cd /var/www/html

# Cache config, routes, and views for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations automatically on deploy
php artisan migrate --force

# Create storage symlink
php artisan storage:link --force 2>/dev/null || true

# Start supervisor (manages nginx + php-fpm)
exec /usr/bin/supervisord -c /etc/supervisord.conf
