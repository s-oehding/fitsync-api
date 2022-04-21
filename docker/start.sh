#!/bin/bash

set -e

#while ! exec 6<>/dev/tcp/${MONGO_DB_HOST}/${MONGO_DB_PORT}; do
#  echo "Trying to connect to DB ${MONGO_DB_HOST}/${MONGO_DB_PORT}"
#  sleep 10
#  echo "Retrying..."
#done
#echo "Running migrations and seeds..."
#
#yarn migrate:run
echo "$LOCAL_MONGO_CONNECT_STRING"

echo "Starting the Monsooq boilerplate..."

case "$NODE_ENV" in
  "development")
      npm run start:debug 1>&2
    ;;
  "local" | "development")
      npm run start:debug 1>&2
    ;;
  "production")
      npm run start:prod
    ;;
esac
