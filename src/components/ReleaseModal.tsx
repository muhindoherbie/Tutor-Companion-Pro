import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Github,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseModal: React.FC<ReleaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'windows' | 'android' | 'pwa'>('github');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleInstallPWA = async () => {
    if (!installPrompt) {
      alert(
        'PWA install prompt is not currently available. You can install directly by clicking the Install icon in your browser address bar (Chrome/Edge on Windows) or tapping "Add to Home screen" in Chrome on Android.'
      );
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWorkflow = () => {
    const workflowContent = `name: Build & Release Desktop (.exe) and Android (.apk)

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-windows:
    name: Build Windows Desktop .exe
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npx --yes electron-builder --win --x64 -c.win.target=nsis -c.nsis.oneClick=false -c.extraMetadata.main=electron.cjs
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: TutorCompanion-Windows-Setup
          path: dist/*.exe

  build-android:
    name: Build Android .apk
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
      - run: |
          npm ci
          npm run build
          npx --yes @capacitor/cli init "Tutor Companion" "com.tutorcompanion.app" --web-dir "dist"
          npm install @capacitor/core @capacitor/android
          npx cap add android
          npx cap sync android
          cd android && chmod +x gradlew && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: TutorCompanion-Android-APK
          path: android/app/build/outputs/apk/debug/*.apk

  publish-release:
    name: Publish GitHub Release
    needs: [build-windows, build-android]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: release-binaries
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ github.ref_name || 'v1.0.0' }}
          name: Tutor Companion \${{ github.ref_name || 'v1.0.0' }} (Windows .exe & Android .apk)
          files: release-binaries/**/*.*
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
    downloadFile('release.yml', workflowContent, 'text/yaml');
  };

  const gitReleaseCommands = `# 1. Add your GitHub repository remote (replace with your repo URL):
git remote add origin https://github.com/YOUR_USERNAME/tutor-companion.git

# 2. Commit all files and push main branch
git branch -M main
git add .
git commit -m "feat: complete academic suite with .exe and .apk release workflow"
git push -u origin main

# 3. Create and push a version tag to trigger automated .exe & .apk build
git tag v1.0.0
git push origin v1.0.0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Public GitHub Release & App Packages
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Windows Executable (.exe)</span>
                <span aria-hidden="true">·</span>
                <span>Android Package (.apk)</span>
                <span aria-hidden="true">·</span>
                <span>Instant PWA</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2 pt-2">
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'github'
                ? 'border-[#00696f] text-[#00696f]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Release CI/CD</span>
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'windows'
                ? 'border-[#00696f] text-[#00696f]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Windows (.exe)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'android'
                ? 'border-[#00696f] text-[#00696f]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (.apk)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pwa'
                ? 'border-[#00696f] text-[#00696f]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Instant PWA Install</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 leading-relaxed">
          {activeTab === 'github' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00696f]" />
                  <span>Automated Multi-Platform Release Pipeline</span>
                </h4>
                <p className="text-xs text-slate-600">
                  A production GitHub Actions workflow file has been placed at{' '}
                  <code className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                    .github/workflows/release.yml
                  </code>
                  . When you push this project to GitHub and push any tag like{' '}
                  <code className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                    v1.0.0
                  </code>
                  , GitHub Actions automatically compiles both the Windows{' '}
                  <strong>.exe</strong> installer and the Android <strong>.apk</strong>, and attaches
                  them directly to your public GitHub Release page!
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Terminal Commands to Publish Release
                  </span>
                  <button
                    onClick={() => copyToClipboard(gitReleaseCommands, 'git')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copiedCode === 'git' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {gitReleaseCommands}
                </pre>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleDownloadWorkflow}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download release.yml Workflow</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#00696f]" />
                  <span>Windows Desktop Executable (.exe)</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Tutor Companion includes full Electron desktop packaging. You can build the
                  installer on any Windows machine with a single script or npm command.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Option 1: Windows Batch Script
                </h5>
                <p className="text-xs text-slate-600">
                  Double-click <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">build-windows-exe.bat</code> in the project root to compile your installer:
                </p>
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                  npm run build:exe
                </pre>
                <p className="text-xs text-slate-500">
                  Outputs: <code className="font-mono text-slate-700">dist/Tutor Companion Setup.exe</code>
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Option 2: Direct Desktop PWA Installation
                </h5>
                <p className="text-xs text-slate-600">
                  You can also run Tutor Companion right now as a standalone windowed desktop app on Windows with offline caching:
                </p>
                <button
                  onClick={handleInstallPWA}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Install as Desktop App Now</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00696f]" />
                  <span>Android Package (.apk)</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Tutor Companion is fully configured for Android via Capacitor and Trusted Web Activity (TWA). It compiles directly to native APK.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Option 1: Bash Build Script
                </h5>
                <p className="text-xs text-slate-600">
                  Execute the script to sync assets and compile with Gradle:
                </p>
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                  bash build-android-apk.sh
                </pre>
                <p className="text-xs text-slate-500">
                  Outputs: <code className="font-mono text-slate-700">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Option 2: Install to Android Home Screen
                </h5>
                <p className="text-xs text-slate-600">
                  On Android devices, tap the menu (3 dots) in Chrome and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong> to launch Tutor Companion full-screen with offline support.
                </p>
                <button
                  onClick={handleInstallPWA}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install on Android Device</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00696f]" />
                  <span>Progressive Web App (PWA) Capabilities</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Tutor Companion is fully PWA-enabled with service worker caching, standalone window mode, high-resolution icons, and offline database persistence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="font-bold text-slate-900 mb-1">🖥️ Windows 10 & 11</p>
                  <p className="text-slate-600">
                    Runs in its own window without browser tabs. Pins directly to the Taskbar and Start Menu.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="font-bold text-slate-900 mb-1">📱 Android 8.0+</p>
                  <p className="text-slate-600">
                    Appears in the Android App Drawer and Home Screen like a native APK. Works offline seamlessly.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleInstallPWA}
                  className="w-full py-3 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstalled ? 'App Already Installed' : 'Install Tutor Companion to This Device'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Automated workflow: <code className="font-mono text-[11px]">.github/workflows/release.yml</code>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
