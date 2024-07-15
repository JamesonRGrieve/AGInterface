#!/bin/sh
echo "" >/app/.env
env | while IFS='=' read -r name value; do
  printf '%s="%s"\n' "$name" "$value" >>/app/.env
done
# Show full env
cat /app/.env
if [ -d "/app/themes" ]; then rm -rf /app/themes; fi
git clone https://github.com/JamesonRGrieve/jrgcomponents-themes /app/themes
set -a
. /app/.env
set +a
theme=$(grep '^THEME_NAME=' /app/.env | cut -d'=' -f2)
theme=$(echo $theme | tr -d '"')
cp -r /app/themes/$theme/* /app
npm install -g npm@latest
npm install

if [ "$ENV" = "development" ]; then
  npm run dev
else
  npm run build && rm /app/.env && npm start
fi
