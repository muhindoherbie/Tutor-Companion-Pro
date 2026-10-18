@echo off
echo ====================================================
echo  Tutor Companion - Windows .EXE Build Script
echo ====================================================
echo.
echo Step 1: Installing dependencies...
call npm install
echo.
echo Step 2: Compiling TypeScript and Vite Production Build...
call npm run build
echo.
echo Step 3: Packaging Windows Executable via Electron Builder...
call npx electron-builder --win --x64 -c.win.target=nsis -c.nsis.oneClick=false -c.extraMetadata.main=electron.cjs
echo.
echo ====================================================
echo  Build Complete!
echo  Your installer is ready in: dist\Tutor Companion Setup.exe
echo ====================================================
pause
