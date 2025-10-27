@echo off

REM =========================================
REM PM2 Windows 开机启动脚本
REM =========================================

pm2 save
schtasks /create /tn "PM2_Startup" /tr "cmd.exe /c pm2 resurrect" /sc onstart /rl highest /f

pause
