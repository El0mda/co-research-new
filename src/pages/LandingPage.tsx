import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { BookOpen, Users, Shield, ListOrdered, Search, UserCheck, MessageCircle, Cloud, CreditCard, Globe, BarChart3, Check } from 'lucide-react';

const reasonIcons = [Users, ListOrdered, Shield, ListOrdered, Search, UserCheck, MessageCircle, Cloud, CreditCard, Globe, BarChart3];

const LandingPage: React.FC = () => {
  const { t, lang } = useLang();
  const [annual, setAnnual] = useState(false);
  const reasons = t('reasons.items') as any as { title: string; desc: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 start-10 h-72 w-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 end-10 h-96 w-96 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container relative py-24 md:py-36 text-center">
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4 animate-fade-in-up">
            {lang === 'ar' ? 'كو-ريسيرش' : 'Co-research'}
          </h1>
          <p className="text-xl md:text-2xl text-gold-gradient font-heading mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('tagline')}
          </p>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t('hero.cta')}
            </Link>
            <a
              href="#reasons"
              className="rounded-lg border border-border px-8 py-3 text-base font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              {t('hero.learnMore')}
            </a>
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section id="reasons" className="py-20 bg-card/50">
        <div className="container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-14">
            {t('reasons.title')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((item, i) => {
              const Icon = reasonIcons[i] || BookOpen;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 card-hover opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-subtle">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-6">
            {t('pricing.title')}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-14">
            <span className={`text-sm ${!annual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{t('pricing.monthly')}</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors ${annual ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-foreground transition-all ${annual ? 'start-[calc(100%-1.625rem)]' : 'start-0.5'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{t('pricing.annual')}</span>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {/* Free */}
            <PricingCard
              name={t('pricing.free.name')}
              price={t('pricing.free.price')}
              currency={t('pricing.currency')}
              perMonth={t('pricing.perMonth')}
              features={t('pricing.free.features') as any as string[]}
              cta={t('pricing.startFree')}
              highlighted={false}
            />
            {/* Researcher */}
            <PricingCard
              name={t('pricing.researcher.name')}
              price={annual ? t('pricing.researcher.priceAnnual') : t('pricing.researcher.price')}
              currency={t('pricing.currency')}
              perMonth={t('pricing.perMonth')}
              features={t('pricing.researcher.features') as any as string[]}
              cta={t('pricing.subscribe')}
              highlighted={true}
              badge={annual ? t('pricing.researcher.badge') : undefined}
            />
            {/* Institution */}
            <PricingCard
              name={t('pricing.institution.name')}
              price={annual ? t('pricing.institution.priceAnnual') : t('pricing.institution.price')}
              currency={t('pricing.currency')}
              perMonth={t('pricing.perMonth')}
              features={t('pricing.institution.features') as any as string[]}
              cta={t('pricing.contactUs')}
              highlighted={false}
              badge={annual ? t('pricing.institution.badge') : undefined}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 Co-research. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </div>
      </footer>
    </div>
  );
};

const PricingCard: React.FC<{
  name: string; price: string; currency: string; perMonth: string;
  features: string[]; cta: string; highlighted: boolean; badge?: string;
}> = ({ name, price, currency, perMonth, features, cta, highlighted, badge }) => (
  <div className={`relative rounded-xl border p-8 ${highlighted ? 'border-primary bg-card shadow-lg shadow-primary/5 scale-105' : 'border-border bg-card'} card-hover`}>
    {badge && (
      <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
        {badge}
      </span>
    )}
    <h3 className="font-heading text-xl font-bold mb-2">{name}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold font-heading">{price}</span>
      <span className="text-sm text-muted-foreground ms-1">{currency}{perMonth}</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    <button className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${highlighted ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-secondary'}`}>
      {cta}
    </button>
  </div>
);

export default LandingPage;
