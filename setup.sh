#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================="
echo "       First-Time Project Setup"
echo "========================================="
echo ""
echo "Prerequisites: Node v24 (see .nvmrc) and Docker."
node -v || echo "Node.js is not installed."
docker --version || echo "Docker is not installed."
echo ""

echo "[1/5] Installing dependencies..."
npm i
echo ""

echo "[2/5] Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example."
    echo ""
    echo "IMPORTANT: Please edit the .env file and set JWT_ACCESS_SECRET"
    echo "to a random string of at least 16 characters before running the app."
    echo "(Note: For tests, .env.test is used automatically.)"
else
    echo ".env file already exists, skipping copy."
fi
echo ""

echo "[3/5] Starting local Postgres via Docker..."
echo "(Make sure your host Postgres service is disabled if it uses port 5432)"
docker compose up -d db

# Wait for Postgres to be ready to accept connections
echo "Waiting for the database to initialize..."
sleep 8
echo ""

echo "[4/5] Applying schema to dev DB (foz_dev)..."
for f in src/backend/db/migrations/*.sql; do
    echo "Applying $(basename "$f")..."
    docker exec -i foz_db psql -U foz -d foz_dev < "$f"
done
echo "Dev migrations complete."
echo ""

echo "[5/5] Test Database Setup (Optional)"
read -p "Do you want to create and migrate the test database (foz_test) for vitest? (y/N): " setup_test

if [[ "$setup_test" =~ ^[Yy]$ ]]; then
    echo "Creating foz_test database..."
    # Disable exit-on-error temporarily in case the DB already exists
    set +e
    docker exec -i foz_db psql -U foz -d postgres -c "CREATE DATABASE foz_test;"
    set -e
    
    echo "Applying schema to test DB (foz_test)..."
    for f in src/backend/db/migrations/*.sql; do
        echo "Applying $(basename "$f")..."
        docker exec -i foz_db psql -U foz -d foz_test < "$f"
    done
    echo "Test migrations complete."
else
    echo "Skipping test database setup."
fi
echo ""

echo "========================================="
echo "Setup Complete!"
echo "========================================="