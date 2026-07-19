@echo off
setlocal EnableDelayedExpansion

echo =========================================
echo       First-Time Project Setup
echo =========================================
echo.
echo Prerequisites: Node v24 (see .nvmrc) and Docker.
node -v
docker --version
echo.

echo [1/5] Installing dependencies...
call npm i
echo.

echo [2/5] Setting up environment variables...
if not exist .env (
    copy .env.example .env >nul
    echo Created .env from .env.example.
    echo.
    echo IMPORTANT: Please edit the .env file and set JWT_ACCESS_SECRET
    echo to a random string of at least 16 characters before running the app.
    echo (Note: For tests, .env.test is used automatically.)
) else (
    echo .env file already exists, skipping copy.
)
echo.

echo [3/5] Starting local Postgres via Docker...
echo (Make sure your host Postgres service is disabled if it uses port 5432)
docker compose up -d db
echo Waiting 8 seconds for the database to initialize...
timeout /t 8 /nobreak >nul
echo.

echo [4/5] Applying schema to dev DB (foz_dev)...
for %%f in (src\backend\db\migrations\*.sql) do (
    echo Applying %%~nxf...
    docker exec -i foz_db psql -U foz -d foz_dev < "%%f"
)
echo Dev migrations complete.
echo.

echo [5/5] Test Database Setup (Optional)
set /p setup_test="Do you want to create and migrate the test database (foz_test) for vitest? (y/N): "
if /I "%setup_test%"=="y" (
    echo Creating foz_test database...
    docker exec -i foz_db psql -U foz -d postgres -c "CREATE DATABASE foz_test;"
    
    echo Applying schema to test DB (foz_test)...
    for %%f in (src\backend\db\migrations\*.sql) do (
        echo Applying %%~nxf...
        docker exec -i foz_db psql -U foz -d foz_test < "%%f"
    )
    echo Test migrations complete.
) else (
    echo Skipping test database setup.
)
echo.

echo =========================================
echo Setup Complete!
echo =========================================
pause