import React, { useState } from 'react';
import { X, Cloud, Terminal, Check, Copy, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RenderDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderDeploymentModal: React.FC<RenderDeploymentModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "Deploy FreeVideoAIMaker"
git branch -M main
git remote add origin https://github.com/YOUR_USER/FreeVideoAIMaker.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-slate-950 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Deploy Free on Render.com
              </h3>
              <p className="text-xs text-slate-400">
                Zero-Cost Node.js Hosting with Secret Hugging Face Protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-300">
          {/* Security Alert: Token Protection */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Secret Scanner Protection (Anti-Revocation)</span>
            </div>
            <p className="text-slate-300">
              Hugging Face automatically detects and revokes tokens if published in raw Git repositories. We have provided ready-to-use <strong>render.yaml</strong> and backend <strong>server.ts</strong> so your key is stored <strong>only in Render's private environment variables</strong>, keeping it 100% private and immune to scanner bots.
            </p>
          </div>

          {/* 4-Step Instructions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-bold">1</span>
              Push Code to GitHub
            </h4>
            <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-slate-300">
              <pre className="overflow-x-auto">{gitCommands}</pre>
              <button
                onClick={() => copyToClipboard(gitCommands, 'git')}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700"
              >
                {copiedCmd === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'git' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-bold">2</span>
              Create Free Web Service on Render
            </h4>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300 pl-2">
              <li>Log in to <a href="https://render.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">render.com</a></li>
              <li>Click <strong>New +</strong> &rarr; <strong>Web Service</strong>.</li>
              <li>Connect your GitHub repository.</li>
              <li>Select <strong>Free Instance Type</strong> ($0/mo).</li>
            </ul>

            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-bold">3</span>
              Set Environment Variables Safely
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <p>Under the <strong>Environment</strong> tab in Render, add this variable:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-700">
                  <span className="text-slate-500">Key:</span> <span className="text-cyan-400">HF_TOKEN</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-700">
                  <span className="text-slate-500">Value:</span> <span className="text-slate-300">hf_••••••••••••••••</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                This encrypts your token inside Render without exposing it in your git repository.
              </p>
            </div>

            <h4 className="font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-bold">4</span>
              Click Deploy Web Service
            </h4>
            <p className="text-xs text-slate-400">
              Render will automatically execute <code>npm run build</code> and launch <code>npm start</code> on port 10000. Your live URL will be ready at <code>https://freevideoaimaker.onrender.com</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Files included: render.yaml, Dockerfile, server.ts
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
