#!/bin/bash

# yetki verme komutu
# sudo chmod +x ./scripts/remove-cache.sh

echo "🚀 PWA Cache Temizleniyor..."

rm -rf dist
rm -rf node_modules/.cache
rm -rf node_modules/.vite


echo "🚀 PWA Cache Temizlendi"