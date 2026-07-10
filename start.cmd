@echo off
echo.
echo ===============================================
echo  🚀 Запуск Value Marketplace
echo ===============================================
echo.

REM Проверяем наличие node_modules
if not exist "node_modules" (
    echo 📦 Устанавливаем зависимости...
    call npm run install-all
)

echo 🎯 Запускаем сервер и клиент...
call npm start

pause

