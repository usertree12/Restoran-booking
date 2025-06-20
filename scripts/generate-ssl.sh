#!/bin/bash


mkdir -p nginx/ssl
mkdir -p nginx/logs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/server.key \
    -out nginx/ssl/server.crt \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=RestaurantBooking/OU=IT/CN=localhost"

echo "SSL сертификаты созданы в nginx/ssl/"
echo "Для продакшена замените на настоящие сертификаты от Let's Encrypt или другого CA" 