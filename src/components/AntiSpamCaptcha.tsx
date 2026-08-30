import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, Check, ShieldAlert } from 'lucide-react';
import { Language } from '../types';

export interface CaptchaRef {
  validate: () => boolean;
  getHoneypotValue: () => string;
  isBotSuspected: () => boolean;
  reset: () => void;
}

interface AntiSpamCaptchaProps {
  lang: Language;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  theme?: 'light' | 'minimal';
}

interface CaptchaQuestion {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  answer: number;
}

const LOCALIZED_CAPTCHA_TEXT: Record<
  Language,
  {
    label: string;
    placeholder: string;
    refreshTooltip: string;
    verified: string;
    incorrect: string;
    emptyWarning: string;
    securityNote: string;
  }
> = {
  id: {
    label: 'Verifikasi Anti-Spam (Keamanan)',
    placeholder: 'Ketik hasil hitungan...',
    refreshTooltip: 'Ganti soal matematika',
    verified: 'Terverifikasi (Bukan Robot)',
    incorrect: 'Jawaban salah! Silakan coba lagi.',
    emptyWarning: 'Selesaikan verifikasi keamanan terlebih dahulu.',
    securityNote: 'Verifikasi bot otomatis',
  },
  en: {
    label: 'Anti-Spam Verification (Security)',
    placeholder: 'Enter the calculation result...',
    refreshTooltip: 'Refresh math challenge',
    verified: 'Verified (Human)',
    incorrect: 'Incorrect answer! Please try again.',
    emptyWarning: 'Please complete the security challenge.',
    securityNote: 'Automated bot protection',
  },
  de: {
    label: 'Anti-Spam-Verifizierung (Sicherheit)',
    placeholder: 'Ergebnis eingeben...',
    refreshTooltip: 'Neue Aufgabe laden',
    verified: 'Verifiziert (Mensch)',
    incorrect: 'Falsche Antwort! Bitte erneut versuchen.',
    emptyWarning: 'Bitte lösen Sie die Sicherheitsaufgabe.',
    securityNote: 'Automatischer Bot-Schutz',
  },
  ja: {
    label: 'スパム防止認証（セキュリティ）',
    placeholder: '計算結果を入力...',
    refreshTooltip: '問題を再読み込み',
    verified: '認証済み（人間）',
    incorrect: '答えが間違っています。再度お試しください。',
    emptyWarning: 'セキュリティ認証を完了してください。',
    securityNote: '自動ボット対策システム',
  },
};

function generateQuestion(): CaptchaQuestion {
  const ops: Array<'+' | '-' | '×'> = ['+', '-', '×'];
  const operator = ops[Math.floor(Math.random() * ops.length)];
  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  if (operator === '+') {
    num1 = Math.floor(Math.random() * 20) + 3;
    num2 = Math.floor(Math.random() * 15) + 2;
    answer = num1 + num2;
  } else if (operator === '-') {
    num1 = Math.floor(Math.random() * 25) + 10;
    num2 = Math.floor(Math.random() * (num1 - 2)) + 1;
    answer = num1 - num2;
  } else {
    // Multiplication with small numbers
    num1 = Math.floor(Math.random() * 9) + 2;
    num2 = Math.floor(Math.random() * 6) + 2;
    answer = num1 * num2;
  }

  return { num1, num2, operator, answer };
}

export const AntiSpamCaptcha = forwardRef<CaptchaRef, AntiSpamCaptchaProps>(
  ({ lang, onValidationChange, className = '', theme = 'light' }, ref) => {
    const [question, setQuestion] = useState<CaptchaQuestion>(generateQuestion);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const mountTimeRef = useRef<number>(Date.now());
    const inputRef = useRef<HTMLInputElement>(null);

    const t = LOCALIZED_CAPTCHA_TEXT[lang] || LOCALIZED_CAPTCHA_TEXT.en;

    const refreshChallenge = () => {
      setIsRefreshing(true);
      const newQ = generateQuestion();
      setQuestion(newQ);
      setUserInput('');
      setStatus('idle');
      setErrorMessage('');
      if (onValidationChange) onValidationChange(false);
      setTimeout(() => setIsRefreshing(false), 300);
    };

    const handleInputChange = (val: string) => {
      setUserInput(val);
      setErrorMessage('');
      const trimmed = val.trim();
      if (trimmed === '') {
        setStatus('idle');
        if (onValidationChange) onValidationChange(false);
        return;
      }

      const numVal = parseInt(trimmed, 10);
      if (!isNaN(numVal) && numVal === question.answer) {
        setStatus('valid');
        if (onValidationChange) onValidationChange(true);
      } else {
        setStatus('idle');
        if (onValidationChange) onValidationChange(false);
      }
    };

    // Expose validation methods to parent form
    useImperativeHandle(ref, () => ({
      validate: () => {
        // Check honeypot: if filled, definitely a bot
        if (honeypot.trim() !== '') {
          return false;
        }

        // Check time spent on form: if less than 1 second, likely automated bot
        const elapsed = Date.now() - mountTimeRef.current;
        if (elapsed < 800) {
          setStatus('invalid');
          setErrorMessage('Submission too fast (Bot detected).');
          return false;
        }

        const trimmed = userInput.trim();
        if (trimmed === '') {
          setStatus('invalid');
          setErrorMessage(t.emptyWarning);
          inputRef.current?.focus();
          return false;
        }

        const numVal = parseInt(trimmed, 10);
        if (isNaN(numVal) || numVal !== question.answer) {
          setStatus('invalid');
          setErrorMessage(t.incorrect);
          inputRef.current?.focus();
          return false;
        }

        setStatus('valid');
        return true;
      },
      getHoneypotValue: () => honeypot,
      isBotSuspected: () => {
        const elapsed = Date.now() - mountTimeRef.current;
        return honeypot.trim() !== '' || elapsed < 800;
      },
      reset: () => {
        refreshChallenge();
        mountTimeRef.current = Date.now();
        setHoneypot('');
      },
    }));

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Hidden Honeypot Field (Invisible to users, traps automated spam scripts) */}
        <div
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            left: '-9999px',
            top: '-9999px',
            height: 0,
            width: 0,
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <label htmlFor="website_url_hp">Leave this field empty</label>
          <input
            id="website_url_hp"
            type="text"
            name="website_url_hp"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Captcha Header Label */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
            <ShieldCheck size={13} className="text-zinc-600" />
            <span>{t.label}</span>
          </label>
          <span className="text-[10px] font-mono-code text-zinc-400 lowercase">
            {t.securityNote}
          </span>
        </div>

        {/* Captcha Interactive Challenge Box */}
        <div
          className={`p-3 rounded-xl border transition-all duration-300 ${
            status === 'valid'
              ? 'bg-emerald-50/60 border-emerald-300'
              : status === 'invalid'
              ? 'bg-rose-50/60 border-rose-300'
              : 'bg-zinc-100/70 border-zinc-200/80 hover:border-zinc-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Math Badge Visual */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-200/90 shadow-2xs select-none">
              <span className="font-mono-code font-bold text-sm tracking-wider text-zinc-800">
                {question.num1} {question.operator} {question.num2} = ?
              </span>
              <button
                type="button"
                onClick={refreshChallenge}
                title={t.refreshTooltip}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-all cursor-pointer"
                aria-label="Refresh Captcha"
              >
                <RefreshCw
                  size={12}
                  className={`transition-transform duration-300 ${isRefreshing ? 'rotate-180 text-zinc-800' : ''}`}
                />
              </button>
            </div>

            {/* Answer Input */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t.placeholder}
                className={`w-full bg-white px-3 py-1.5 text-xs sm:text-sm font-mono-code rounded-lg border focus:outline-hidden transition-colors ${
                  status === 'valid'
                    ? 'border-emerald-500 text-emerald-950 pr-8'
                    : status === 'invalid'
                    ? 'border-rose-400 text-rose-950 focus:border-rose-600'
                    : 'border-zinc-300 focus:border-zinc-800 text-zinc-900 placeholder:text-zinc-400'
                }`}
              />

              {status === 'valid' && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-emerald-600">
                  <Check size={14} className="stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {status === 'valid' && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono-code text-emerald-700">
              <ShieldCheck size={12} />
              <span>{t.verified}</span>
            </div>
          )}

          {status === 'invalid' && errorMessage && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono-code text-rose-600 animate-in fade-in">
              <ShieldAlert size={12} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AntiSpamCaptcha.displayName = 'AntiSpamCaptcha';
