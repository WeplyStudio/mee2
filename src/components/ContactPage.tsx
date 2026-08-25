import React, { useState, useEffect } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/portfolioData';
import { ArrowUpRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ContactPageProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang, onNavigateHome }) => {
  const t = TRANSLATIONS[lang];

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
    }, 1200);
  };

  const handlePhoneChange = (val: string) => {
    setFormData((prev) => ({ ...prev, phone: val }));
  };

  return (
    <div className="pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-6 sm:px-12">
      {/* Main Grid matching the exact reference UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start pb-24 border-b border-zinc-200/80">
        
        {/* Left Column: Headline statement */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal delay={100} distance={20}>
            <h1 className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold tracking-tight text-zinc-900 leading-[1.35] lowercase">
              {lang === 'tr'
                ? 'çevrimiçi bir toplantı ayarlamak veya sorularınızı sormak için lütfen benimle iletişime geçin.'
                : lang === 'id'
                ? 'silakan hubungi saya untuk menjadwalkan pertemuan daring atau mengajukan pertanyaan apapun.'
                : 'please contact me to set up an online meeting or ask any questions you have.'}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={180} distance={20}>
            <p className="text-xs sm:text-sm text-zinc-500 font-mono-code leading-relaxed max-w-sm lowercase">
              {lang === 'tr'
                ? 'yeni bir fikir, ürün geliştirme veya kullanıcı deneyimi tasarımı hakkında konuşmaktan mutluluk duyarım.'
                : lang === 'id'
                ? 'senang berbicara tentang ide baru, pengembangan produk, atau desain antarmuka pengguna.'
                : "happy to discuss new ideas, product engineering, or interface design systems."}
            </p>
          </ScrollReveal>
        </div>

        {/* Right Column: [let's talk] & Form */}
        <div className="lg:col-span-7 space-y-8">
          <ScrollReveal delay={120} distance={15}>
            <div className="text-[11px] font-mono-code text-zinc-400 lowercase tracking-wider">
              [let's talk]
            </div>
          </ScrollReveal>

          {isSuccess ? (
            <ScrollReveal delay={100} distance={20}>
              <div className="p-8 sm:p-10 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 size={24} />
                  <span className="font-bold text-base lowercase">
                    {lang === 'tr' ? 'mesajınız başarıyla iletildi!' : lang === 'id' ? 'pesan anda berhasil terkirim!' : 'message sent successfully!'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed lowercase">
                  {lang === 'tr'
                    ? 'en kısa sürede sizinle iletişime geçeceğim. vakit ayırdığınız için teşekkürler.'
                    : lang === 'id'
                    ? 'saya akan segera menghubungi anda kembali. terima kasih atas waktunya.'
                    : 'i will get back to you as soon as possible. thank you for reaching out.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-mono-code text-zinc-900 underline hover:text-blue-700 cursor-pointer lowercase"
                  >
                    {lang === 'tr' ? 'yeni bir mesaj gönder' : lang === 'id' ? 'kirim pesan baru' : 'send another message'}
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
                    name, surname
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="steward jason liuwindra"
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Company */}
              <ScrollReveal delay={180} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="apple computer, inc."
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Email */}
              <ScrollReveal delay={210} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@example.com"
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Phone */}
              <ScrollReveal delay={240} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+90 (5__) ___ __ __"
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase font-mono-code"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Subject */}
              <ScrollReveal delay={270} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="web app, mobile app, ui/ux design"
                    className="w-full bg-transparent border-b border-zinc-300 pb-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-hidden focus:border-zinc-900 transition-colors lowercase"
                  />
                </div>
              </ScrollReveal>

              {/* Field: Message */}
              <ScrollReveal delay={300} distance={15}>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-[13px] font-mono-code text-zinc-900 lowercase font-medium">
                    message
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="describe whatever you want."
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
                    <span>• {isSubmitting ? (lang === 'tr' ? 'gönderiliyor...' : 'sending...') : "let's get started"}</span>
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
            <span className="text-zinc-400 lowercase">[contact]</span>
            <a
              href="mailto:ynsmrkrkmzz@gmail.com"
              className="text-zinc-800 hover:text-black transition-colors font-medium lowercase"
            >
              ynsmrkrkmzz@gmail.com
            </a>
          </div>

          {/* Right social connect */}
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 lowercase">[connect]</span>
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
