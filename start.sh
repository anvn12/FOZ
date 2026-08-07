#!/usr/bin/env bash

echo "========================================="
echo "       Starting Local Development"
echo "========================================="
echo ""

echo "Starting Database (Postgres) via Docker..."
docker compose up -d db

echo "Waiting 5 seconds for the database to be ready..."
sleep 5
echo ""

# npm run dev:be
echo "Starting Backend on port 4000..."
npm run dev:be &
BE_PID=$!

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