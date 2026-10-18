import React, { useState } from 'react';
import {
  Settings,
  RefreshCw,
  Check,
  Download,
  Upload,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import { dbService } from '../../services/database';

export const SettingsScreen: React.FC = () => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleReset = () => {
    dbService.resetDefaults();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  const handleExportWorkspace = () => {
    const json = dbService.exportFullWorkspace();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tutor_Companion_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = dbService.importFullWorkspace(content);
      if (success) {
        alert('Workspace successfully restored from backup file!');
      } else {
        alert('Could not parse the backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#00696f]" />
          <span>Workspace Settings & Cloud Sync</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage local offline storage, backup and restore full workspace data, and configure
          institutional parameters with zero capacity limitations.
        </p>
      </div>

      {/* Storage & Limits */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00696f]/10 text-[#00696f] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Unlimited Capacity Enabled</h3>
            <p className="text-xs text-slate-500">
              No limits on number of classes, course units, reference files, students, or exam papers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Classes</span>
            <span className="text-xl font-bold text-slate-900">Unlimited</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Course Units</span>
            <span className="text-xl font-bold text-slate-900">Unlimited</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Student Records</span>
            <span className="text-xl font-bold text-slate-900">Unlimited</span>
          </div>
        </div>
      </div>

      {/* Desktop (.exe) & Mobile (.apk) Release Packages */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Desktop (.exe) & Android (.apk) Releases</h3>
              <p className="text-xs text-slate-300">
                Automated GitHub Releases, Windows NSIS executable build, and Android APK deployment.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700">
            v1.0.0
          </span>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-release-modal'))}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <span>Open Release Hub (.exe & .apk)</span>
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Full Workspace Backup & Restore</h3>
            <p className="text-xs text-slate-500">
              Download your entire workspace (classes, units, notes, assessments, students, and marks)
              as a portable JSON snapshot.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportWorkspace}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            {backupSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{backupSuccess ? 'Backup File Downloaded!' : 'Export Workspace Backup (JSON)'}</span>
          </button>

          <label className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Restore Workspace Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportWorkspace}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Reset Demo Workspace</h3>
        <p className="text-xs text-slate-500">
          Restore sample classes, lecture notes, assessments, and student records for testing and demonstration.
        </p>

        <div className="pt-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors"
          >
            {resetSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Workspace reset to default demo state</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Sample Pharmacy Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
