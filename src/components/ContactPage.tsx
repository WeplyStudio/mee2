import React, { useState, useEffect } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/portfolioData';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ContactPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang, onNavigateHome }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const localizedContent = {
    id: {
      headline: 'silakan hubungi saya untuk menjadwalkan pertemuan daring atau mengajukan pertanyaan apapun.',
      subheadline: 'senang berbicara tentang ide baru, pengembangan produk, atau sistem desain antarmuka pengguna.',
      talkLabel: "[mari berbincang]",
      contactLabel: '[kontak]',
      connectLabel: '[terhubung]',
      nameLabel: 'nama lengkap',
      namePlaceholder: 'steward jason liuwindra',
      companyLabel: 'perusahaan / instansi',
      companyPlaceholder: 'apple computer, inc.',
      emailLabel: 'email',
      emailPlaceholder: 'contoh@domain.com',
      phoneLabel: 'telepon / whatsapp',
      phonePlaceholder: '+62 812 3456 7890',
      subjectLabel: 'subjek',
      subjectPlaceholder: 'aplikasi web, aplikasi seluler, desain ui/ux',
      messageLabel: 'pesan',
      messagePlaceholder: 'jelaskan apa pun yang ingin anda diskusikan.',
      btnSubmit: 'mari mulai bekerja sama',
      btnSending: 'mengirimkan...',
      successTitle: 'pesan anda berhasil terkirim!',
      successDesc: 'saya akan segera menghubungi anda kembali. terima kasih atas waktunya.',
      sendAnother: 'kirim pesan lain',
    },
    en: {
      headline: 'please contact me to set up an online meeting or ask any questions you have.',
      subheadline: 'happy to discuss new ideas, product engineering, or interface design systems.',
      talkLabel: "[let's talk]",
      contactLabel: '[contact]',
      connectLabel: '[connect]',
      nameLabel: 'name, surname',
      namePlaceholder: 'steward jason liuwindra',
      companyLabel: 'company',
      companyPlaceholder: 'apple computer, inc.',
      emailLabel: 'email',
      emailPlaceholder: 'example@example.com',
      phoneLabel: 'phone',
      phonePlaceholder: '+1 (555) 000-0000',
      subjectLabel: 'subject',
      subjectPlaceholder: 'web app, mobile app, ui/ux design',
      messageLabel: 'message',
      messagePlaceholder: 'describe whatever you want.',
      btnSubmit: "let's get started",
      btnSending: 'sending...',
      successTitle: 'message sent successfully!',
      successDesc: 'i will get back to you as soon as possible. thank you for reaching out.',
      sendAnother: 'send another message',
    },
    de: {
      headline: 'kontaktieren sie mich gerne für ein online-meeting oder bei offenen fragen.',
      subheadline: 'ich freue mich darauf, neue ideen, produktentwicklung oder designsysteme zu besprechen.',
      talkLabel: '[gesprech]',
      contactLabel: '[kontakt]',
      connectLabel: '[verbinden]',
      nameLabel: 'vor- und nachname',
      namePlaceholder: 'steward jason liuwindra',
      companyLabel: 'unternehmen',
      companyPlaceholder: 'apple computer, inc.',
      emailLabel: 'e-mail',
      emailPlaceholder: 'beispiel@domain.de',
      phoneLabel: 'telefonnummer',
      phonePlaceholder: '+49 170 1234567',
      subjectLabel: 'betreff',
      subjectPlaceholder: 'web-app, mobile app, ui/ux design',
      messageLabel: 'nachricht',
      messagePlaceholder: 'beschreiben sie ihr anliegen oder projekt.',
      btnSubmit: 'lassen sie uns starten',
      btnSending: 'wird gesendet...',
      successTitle: 'nachricht erfolgreich übermittelt!',
      successDesc: 'ich werde mich so schnell wie möglich bei ihnen melden. vielen dank.',
      sendAnother: 'weitere nachricht senden',
    },
    ja: {
      headline: 'オンラインでのご相談やご質問など、お気軽にお問い合わせください。',
      subheadline: '新規プロジェクト、プロダクト開発、UI/UXデザインシステムについてディスカッションしましょう。',
      talkLabel: '[お問い合わせ]',
      contactLabel: '[連絡先]',
      connectLabel: '[ソーシャル]',
      nameLabel: 'お名前',
      namePlaceholder: 'スチュワード・ジェイソン',
      companyLabel: '貴社名・組織名',
      companyPlaceholder: 'アップルコンピュータ株式会社',
      emailLabel: 'メールアドレス',
      emailPlaceholder: 'sample@example.com',
      phoneLabel: 'お電話番号',
      phonePlaceholder: '+81 90 1234 5678',
      subjectLabel: 'ご相談内容（件名）',
      subjectPlaceholder: 'Webアプリ、モバイル開発、UI/UXデザイン設計',
      messageLabel: 'メッセージ本文',
      messagePlaceholder: 'プロジェクトの概要やご要望をご記入ください。',
      btnSubmit: 'プロジェクトを始める',
      btnSending: '送信中...',
      successTitle: 'メッセージが正常に送信されました！',
      successDesc: '内容を確認の上、速やかにご返信いたします。お問い合わせありがとうございます。',
      sendAnother: '別のメッセージを送信する',
    }
  };

  const c = localizedContent[lang] || localizedContent.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 1000);
  };

  return (
    <div className="pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-6 sm:px-12">
      {/* Main Grid matching the exact reference UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start pb-24 border-b border-zinc-200/80">
        
        {/* Left Column: Headline statement */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal delay={100} distance={20}>
            <h1 className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold tracking-tight text-zinc-900 leading-[1.35] lowercase">
              {c.headline}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={180} distance={20}>
            <p className="text-xs sm:text-sm text-zinc-500 font-mono-code leading-relaxed max-w-sm lowercase">
              {c.subheadline}
            </p>
          </ScrollReveal>
        </div>

        {/* Right Column: [let's talk] & Form */}
        <div className="lg:col-span-7 space-y-8">
          <ScrollReveal delay={120} distance={15}>
            <div className="text-[11px] font-mono-code text-zinc-400 lowercase tracking-wider">
              {c.talkLabel}
            </div>
          </ScrollReveal>

          {isSuccess ? (
            <ScrollReveal delay={100} distance={20}>
              <div className="p-8 sm:p-10 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 size={24} />
                  <span className="font-bold text-base lowercase">
                    {c.successTitle}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed lowercase">
                  {c.successDesc}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-mono-code text-zinc-900 underline hover:text-blue-700 cursor-pointer lowercase"
                  >
                    {c.sendAnother}
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
              {/* Field: Name, Surname */}
              <ScrollReveal delay={150} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    {c.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={c.namePlaceholder}
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Company */}
              <ScrollReveal delay={180} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    {c.companyLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={c.companyPlaceholder}
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Email */}
              <ScrollReveal delay={210} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    {c.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={c.emailPlaceholder}
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Phone */}
              <ScrollReveal delay={240} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    {c.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder={c.phonePlaceholder}
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase font-mono-code"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Subject */}
              <ScrollReveal delay={270} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    {c.subjectLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={c.subjectPlaceholder}
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Message */}
              <ScrollReveal delay={300} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    {c.messageLabel}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={c.messagePlaceholder}
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors resize-none lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Purple pill button matching screenshot */}
              <ScrollReveal delay={330} distance={15}>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-mono-code transition-all duration-300 shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer lowercase disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    )}
                    <span>• {isSubmitting ? c.btnSending : c.btnSubmit}</span>
                  </button>
                </div>
              </ScrollReveal>
            </form>
          )}
        </div>
      </div>

      {/* Middle Direct Links Row matching screenshot */}
      <ScrollReveal delay={200} distance={20}>
        <div className="py-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-xs font-mono-code">
          {/* Left direct contact */}
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 lowercase">{c.contactLabel}</span>
            <a
              href="mailto:hello@itsjason.my.id"
              className="text-zinc-800 hover:text-black transition-colors font-medium lowercase"
            >
              hello@itsjason.my.id
            </a>
          </div>

          {/* Right social connect */}
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 lowercase">{c.connectLabel}</span>
            <div className="flex items-center gap-3 text-zinc-800">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black transition-colors lowercase"
              >
                instagram
              </a>
              <span className="text-zinc-300">,</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black transition-colors lowercase"
              >
                github
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};
