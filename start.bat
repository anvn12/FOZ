@echo off
setlocal

set TARGET_DB=%1
if "%TARGET_DB%"=="" set TARGET_DB=dev

echo =========================================
echo       Starting Local Environment
echo =========================================
echo Target Mode: %TARGET_DB%
echo.

echo Starting Database (Postgres) via Docker...
docker compose up -d db

echo Waiting 3 seconds for the database to be ready...
ping 127.0.0.1 -n 4 >nul
echo.

if /I "%TARGET_DB%"=="empty" goto RUN_EMPTY
if /I "%TARGET_DB%"=="populated" goto RUN_POPULATED
goto RUN_DEV

:RUN_EMPTY
echo Provisioning and resetting Empty Test DB (foz_test_empty)...
call npm run db:test:empty:reset
echo Starting Backend targeting foz_test_empty...
start "Foz Backend (Empty Test DB)" cmd /k "set DATABASE_URL=postgres://foz:foz@localhost:5432/foz_test_empty&& npm run dev:be"
goto START_FRONTEND

:RUN_POPULATED
echo Provisioning and resetting Populated Test DB (foz_test_populated)...
call npm run db:test:populated:reset
echo Starting Backend targeting foz_test_populated...
start "Foz Backend (Populated Test DB)" cmd /k "set DATABASE_URL=postgres://foz:foz@localhost:5432/foz_test_populated&& npm run dev:be"
goto START_FRONTEND

:RUN_DEV
echo Starting Backend targeting default database (foz_dev)...
start "Foz Backend" cmd /k "npm run dev:be"
goto START_FRONTEND

:START_FRONTEND
echo Starting Frontend on port 5173...
start "Foz Frontend" cmd /k "npm run dev:fe"

echo.
echo Development servers are starting!
echo - Database is running in the background via Docker
echo - Backend will be available on :4000
echo - Frontend will be available on :5173
echo.