import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("00963900000000");

  // Dynamically requests database synchronization configuration metrics on runtime
  useEffect(() => {
    fetch('/api/site/config')
      .then(res => res.json())
      .then(data => {
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber.trim());
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Unified Brand Notation */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-200 tracking-tight">FreeVideoAIMaker</span>
          <span className="text-slate-600">|</span>
          <span>© {new Date().getFullYear()} Cloud Video Engine. All rights reserved.</span>
        </div>

        {/* Dynamic WhatsApp Integration Grid Core */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me{whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/10"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950 shrink-0" />
            <span>Contact Customer Support via WhatsApp</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
