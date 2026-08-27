import React from 'react';
import { 
  HelpCircle, 
  Smartphone, 
  Globe, 
  FileSpreadsheet, 
  ShieldCheck, 
  Award, 
  CheckCircle, 
  Sparkles, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Vikalp Duty System — Complete Guide
              </h3>
              <p className="text-xs text-slate-500">
                Setup, Deployment, Google Sheets, PWA Installation & Core Concepts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs text-slate-700">
          {/* Section 1: Android PWA Installation */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
              <Smartphone className="w-4 h-4 text-teal-700" />
              <span>1. How to Install on Android Mobile ("Add to Home Screen")</span>
            </div>
            <p className="text-teal-800 leading-relaxed">
              Vikalp is built as a 100% FREE Progressive Web App (PWA). It does not require downloading from Google Play Store:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-teal-950 pl-1 font-medium">
              <li>Open the app URL in <strong>Google Chrome</strong> or <strong>Brave Browser</strong> on your Android phone.</li>
              <li>Tap the <strong>three dots (⋮)</strong> menu icon at the top right of Chrome.</li>
              <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
              <li>Confirm the name <strong>"Vikalp Duty"</strong>. A standalone app icon will be placed directly on your phone home screen!</li>
              <li>The app opens full-screen with fast touch controls and works offline.</li>
            </ol>
          </div>

          {/* Section 2: Core Concept & Point System */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Award className="w-4 h-4 text-amber-600" />
              <span>2. Core Concept & Automatic Point System</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Exactly 3 Duty Days per Week:</strong> Each volunteer is assigned exactly 3 days (e.g. Rahul on Mon/Wed/Fri).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>+0.5 Points per Duty:</strong> Every completed Pickup duty = +0.5 pts; every Drop duty = +0.5 pts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Fair Duty Allocation:</strong> The Points page ranks volunteers from lowest to highest points so duty coordinators can prioritize assigning shifts to members with fewer points.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Duplicate Protection:</strong> The system automatically warns if a volunteer is recorded twice for the same date and duty type.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Google Sheets Free Database */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>3. How to Connect Google Sheets (Free Database)</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              You can connect Google Sheets using a simple Google Apps Script web app endpoint:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-emerald-950 pl-1 font-medium">
              <li>Open <strong>Settings &gt; Google Sheets</strong> tab in this app.</li>
              <li>Click <strong>"Copy Google Apps Script Code"</strong>.</li>
              <li>Create a new spreadsheet at sheets.google.com and open <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Paste the code, click <strong>Deploy &gt; New deployment &gt; Web app</strong>.</li>
              <li>Set <em>Execute as: "Me"</em> and <em>Who has access: "Anyone"</em>.</li>
              <li>Paste the generated deployment URL into the Settings page and click Sync!</li>
            </ol>
          </div>

          {/* Section 4: Admin Login & PIN */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>4. Admin Login & Credentials</span>
            </div>
            <p className="text-slate-600">
              The default admin passcode is: <strong className="bg-slate-200 px-2 py-0.5 rounded text-slate-900 font-mono">1234</strong>
            </p>
            <p className="text-slate-500 text-[11px]">
              You can customize the PIN anytime in the Settings modal under the "Admin PIN" tab.
            </p>
          </div>

          {/* Section 5: Free Deployment Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>5. How to Deploy 100% Free to the Web</span>
            </div>
            <p className="text-slate-600">
              This app is a standard React + Vite PWA and can be deployed for zero cost on:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
              <li><strong>Cloud Run / AI Studio Share:</strong> Instant 1-click sharing via the top menu.</li>
              <li><strong>Vercel or Netlify:</strong> Connect GitHub repository, build command `npm run build`, output directory `dist`.</li>
              <li><strong>GitHub Pages:</strong> Push `dist/` branch with static hosting.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 underline flex items-center gap-1"
          >
            <span>Open Google Sheets Settings</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
