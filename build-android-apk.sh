#!/usr/bin/env bash
set -e

echo "===================================================="
echo " Tutor Companion - Android .APK Build Script"
echo "===================================================="
echo ""

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Building Web Production Assets..."
npm run build

echo "Step 3: Initializing Capacitor Android Project..."
npx @capacitor/cli init "Tutor Companion" "com.tutorcompanion.app" --web-dir "dist" || true
npm install @capacitor/core @capacitor/android
npx cap add android || true
npx cap sync android

echo "Step 4: Compiling APK with Gradle..."
cd android
chmod +x gradlew
./gradlew assembleDebug
cd ..

echo "===================================================="
echo " Build Complete!"
echo " Your Android APK is located at: android/app/build/outputs/apk/debug/app-debug.apk"
echo "===================================================="
