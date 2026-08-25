import React, { useState } from 'react';
import { X, Send, Copy, Check, Mail, MessageSquare, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ContactModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const emailAddress = 'hello@itsjason.my.id';

  const handleCopy = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch { }
  };

  const texts: Record<Language, { copy: string; copied: string; title: string; subtitle: string }> = {
    id: {
      copy: 'Salin Email',
      copied: 'Disalin!',
      title: 'Hubungi Saya',
      subtitle: 'Kirim pesan untuk proyek baru, kolaborasi, atau sekadar menyapa.'
    },
    en: {
      copy: 'Copy Email',
      copied: 'Copied!',
      title: 'Get In Touch',
      subtitle: 'Drop a message for new projects, creative collaborations, or just to say hi.'
    },
    de: {
      copy: 'E-Mail kopieren',
      copied: 'Kopiert!',
      title: 'Kontakt aufnehmen',
      subtitle: 'Senden Sie eine Nachricht für neue Projekte, Kooperationen oder einfach zum Kennenlernen.'
    },
    ja: {
      copy: 'メールアドレスをコピー',
      copied: 'コピー完了！',
      title: 'お問い合わせ',
      subtitle: '新規プロジェクト、コラボレーション、またはカジュアルなご挨拶もお気軽にどうぞ。'
    }
  };

  const current = texts[lang] || texts.en;
  const copyText = current.copy;
  const copiedText = current.copied;
  const modalTitle = current.title;
  const modalSubtitle = current.subtitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white text-zinc-900 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-zinc-200 relative overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="space-y-1 mb-6">
          <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400">[contact]</div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">{modalTitle}</h3>
          <p className="text-xs sm:text-sm text-zinc-500">{modalSubtitle}</p>
        </div>

        {/* Quick Email Copy Box */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-200/80 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-zinc-700" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-zinc-400 uppercase font-mono-code tracking-wider">Direct Email</div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-800 truncate">{emailAddress}</div>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? copiedText : copyText}</span>
          </button>
        </div>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="text-base font-bold text-emerald-950">
              {lang === 'tr' ? 'Mesajınız Gönderildi!' : lang === 'id' ? 'Pesan Terkirim!' : 'Message Received!'}
            </h4>
            <p className="text-xs text-emerald-700 max-w-sm mx-auto">
              {lang === 'tr' 
                ? 'İlginiz için teşekkürler. En kısa sürede sizinle iletişime geçeceğim.'
                : lang === 'id'
                ? 'Terima kasih atas pesan Anda. Saya akan segera merespons Anda.'
                : 'Thank you for reaching out. I will get back to you shortly.'}
            </p>
            <button
              onClick={() => { setSent(false); onClose(); }}
              className="mt-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg"
            >
              {lang === 'tr' ? 'Kapat' : lang === 'id' ? 'Tutup' : 'Done'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono-code text-zinc-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono-code text-zinc-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono-code text-zinc-500 uppercase mb-1">Message</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project or vision..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-black flex items-center gap-0.5"
                >
                  Instagram <ArrowUpRight size={11} />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-black flex items-center gap-0.5"
                >
                  GitHub <ArrowUpRight size={11} />
                </a>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-transform active:scale-95 shadow-md"
              >
                <span>{lang === 'tr' ? 'Gönder' : lang === 'id' ? 'Kirim Pesan' : 'Send Message'}</span>
                <Send size={13} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
