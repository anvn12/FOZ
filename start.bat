@echo off
echo =========================================
echo       Starting Local Development
echo =========================================
echo.

echo Starting Database (Postgres) via Docker...
docker compose up -d db

echo Waiting 5 seconds for the database to be ready...
timeout /t 5 /nobreak >nul
echo.

@REM npm run dev:be
echo Starting Backend on port 4000...
start "Foz Backend" cmd /k "npm run dev:be"

@REM npm run dev:fe
echo Starting Frontend on port 5173...
start "Foz Frontend" cmd /k "npm run dev:fe"

echo Development servers are starting!
echo - Database is running in the background via Docker
echo - Backend will be available on :4000
echo - Frontend will be available on :5173
echo.