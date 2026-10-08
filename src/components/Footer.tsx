import React, { useEffect, useState } from 'react';
import { MessageSquare, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onOpenRenderGuide: () => void;
  onGoToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoToAdmin }) => {
  const [waNumber, setWhatsappNumber] = useState("00963900000000");

  useEffect(() => {
    fetch('/api/site/whatsapp')
      .then(res => res.json())
      .then(data => { if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber); })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-12 text-xs text-slate-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-200">FreeVideoAIMaker</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
            <span>Contact Customer Support</span>
          </a>
          
          <button
            onClick={onGoToAdmin}
            className="text-slate-700 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Gateway</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
