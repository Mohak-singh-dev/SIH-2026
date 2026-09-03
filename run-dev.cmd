@echo off
REM Use npm.cmd so PowerShell execution-policy settings cannot block the Vite server.
call npm.cmd run dev
