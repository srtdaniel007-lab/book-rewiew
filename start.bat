@echo off
echo ========================================================
echo   Starting BookReads (Goodreads Clone) Full-Stack App
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching FastAPI Backend on port 8001...
start "FastAPI Backend" cmd /k "cd backend && venv\Scripts\python.exe run.py"

echo [2/2] Launching React Frontend on port 5173...
start "React Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ========================================================
echo  Backend:  http://127.0.0.1:8001 (Docs: /docs)
echo  Frontend: http://localhost:5173
echo ========================================================
echo.
echo You can minimize this window.
pause
