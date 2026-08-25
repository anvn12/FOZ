#!/usr/bin/env bash

TARGET_DB="${1:-dev}"

echo "========================================="
echo "       Starting Local Environment"
echo "========================================="
echo "Target Mode: $TARGET_DB"
echo ""

echo "Starting Database (Postgres) via Docker..."
docker compose up -d db

echo "Waiting 3 seconds for the database to be ready..."
sleep 3
echo ""

if [ "$TARGET_DB" = "empty" ]; then
  echo "Provisioning and resetting Empty Test DB (foz_test_empty)..."
  npm run db:test:empty:reset
  echo "Starting Backend targeting foz_test_empty..."
  DATABASE_URL="postgres://foz:foz@localhost:5432/foz_test_empty" npm run dev:be &
  BE_PID=$!
elif [ "$TARGET_DB" = "populated" ]; then
  echo "Provisioning and resetting Populated Test DB (foz_test_populated)..."
  npm run db:test:populated:reset
  echo "Starting Backend targeting foz_test_populated..."
  DATABASE_URL="postgres://foz:foz@localhost:5432/foz_test_populated" npm run dev:be &
  BE_PID=$!
else
  echo "Starting Backend targeting default database (foz_dev)..."
  npm run dev:be &
  BE_PID=$!
fi

# npm run dev:fe
echo "Starting Frontend on port 5173..."
npm run dev:fe &
FE_PID=$!

echo ""
echo "Development servers are running!"
echo "- Database is running in the background via Docker"
echo "- Backend will be available on :4000"
echo "- Frontend will be available on :5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "========================================="
echo ""

# Catch Ctrl+C (SIGINT) to gracefully stop both frontend and backend
trap "echo -e '\nStopping servers...'; kill $BE_PID $FE_PID 2>/dev/null; exit" SIGINT SIGTERM