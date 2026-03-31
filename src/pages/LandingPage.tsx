import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import {
  BookOpen, Users, Shield, ListOrdered, Search,
  UserCheck, MessageCircle, Cloud, CreditCard, Globe,
  BarChart3, Check, ArrowRight,
} from 'lucide-react';

const reasonIcons = [
  Users, Search, UserCheck, ListOrdered, BarChart3,
  MessageCircle, BookOpen, Shield, CreditCard, Globe, BarChart3,
];

const LandingPage: React.FC = () => {
  const { t, lang } = useLang();
  const [annual, setAnnual] = useState(false);
  const reasons = t('reasons.items') as any as { title: string; desc: string }[];

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <Header />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'hsl(var(--navy-deep))',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 85% 50% / 0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Warm glow top-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-10%',
            right: '-5%',
            width: '50vw',
            height: '60vh',
            background: 'radial-gradient(ellipse, hsl(42 85% 50% / 0.08) 0%, transparent 70%)',
          }}
        />
        {/* Cool glow bottom-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-10%',
            left: '-5%',
            width: '40vw',
            height: '50vh',
            background: 'radial-gradient(ellipse, hsl(222 52% 40% / 0.25) 0%, transparent 70%)',
          }}
        />

        <div className="container relative py-28 md:py-40 text-center">

          {/* Section label */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full"
              style={{
                color: 'hsl(var(--gold))',
                background: 'hsl(var(--gold) / 0.08)',
                border: '1px solid hsl(var(--gold) / 0.2)',
              }}
            >
              منصة البحث العلمي التعاوني
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="animate-fade-in-up mb-5"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(3.2rem, 9vw, 7rem)',
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: 'hsl(var(--cream))',
              animationDelay: '0.05s',
            }}
          >
            {lang === 'ar' ? 'كو‑ريسيرش' : 'Co-research'}
          </h1>

          {/* Gold divider */}
          <div
            className="mx-auto mb-6 animate-fade-in-up"
            style={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)',
              animationDelay: '0.1s',
            }}
          />

          {/* Tagline */}
          <p
            className="animate-fade-in-up mb-5"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
              fontStyle: 'italic',
              color: 'hsl(var(--gold-light))',
              animationDelay: '0.15s',
            }}
          >
            {t('tagline')}
          </p>

          {/* Subtitle */}
          <p
            className="max-w-lg mx-auto mb-12 text-base animate-fade-in-up"
            style={{
              color: 'hsl(var(--cream) / 0.6)',
              lineHeight: 1.8,
              animationDelay: '0.2s',
            }}
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA row */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 btn-gold text-sm"
              style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem' }}
            >
              {t('hero.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#reasons"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200"
              style={{
                color: 'hsl(var(--cream) / 0.75)',
                padding: '0.75rem 2rem',
                border: '1.5px solid hsl(var(--cream) / 0.15)',
                borderRadius: 'var(--radius)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(var(--cream) / 0.4)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(var(--cream))';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'hsl(var(--cream) / 0.15)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'hsl(var(--cream) / 0.75)';
              }}
            >
              {t('hero.learnMore')}
            </a>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-6 max-w-sm mx-auto mt-20 animate-fade-in-up"
            style={{
              animationDelay: '0.35s',
              borderTop: '1px solid hsl(var(--cream) / 0.08)',
              paddingTop: '2rem',
            }}
          >
            {[
              { num: '١١+', label: lang === 'ar' ? 'سببًا للانضمام' : 'Reasons to join' },
              { num: '٣',   label: lang === 'ar' ? 'خطط للأسعار' : 'Pricing plans' },
              { num: '١٠٠٪', label: lang === 'ar' ? 'حماية للحقوق' : 'Rights protected' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'hsl(var(--gold))',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                  }}
                >
                  {s.num}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'hsl(var(--cream) / 0.45)', letterSpacing: '0.04em' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          REASONS
      ════════════════════════════════════════ */}
      <section id="reasons" className="py-24" style={{ background: 'hsl(var(--background))' }}>
        <div className="container">

          {/* Section header */}
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">
              {lang === 'ar' ? 'لماذا كو-ريسيرش؟' : 'Why Co-research?'}
            </span>
            <h2
              className="mt-4"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 600,
                color: 'hsl(var(--navy-deep))',
                lineHeight: 1.15,
              }}
            >
              {t('reasons.title')}
            </h2>
            <div
              className="mx-auto mt-4"
              style={{
                width: '48px',
                height: '2px',
                background: 'hsl(var(--gold))',
                borderRadius: '2px',
              }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((item, i) => {
              const Icon = reasonIcons[i] || BookOpen;
              return (
                <div
                  key={i}
                  className="card-hover p-6 group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Number + icon row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200"
                      style={{
                        background: 'hsl(var(--gold-muted))',
                        border: '1px solid hsl(var(--gold) / 0.2)',
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: 'hsl(36 60% 32%)' }} />
                    </div>
                    <span
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '2rem',
                        fontWeight: 700,
                        lineHeight: 1,
                        color: 'hsl(var(--navy) / 0.06)',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3
                    className="mb-2"
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'hsl(var(--navy-deep))',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'hsl(var(--muted-foreground))',
                      lineHeight: 1.75,
                    }}
                  >
                    {item.desc}
                  </p>

                  {/* Bottom accent line on hover */}
                  <div
                    className="mt-5 h-[1.5px] transition-all duration-300 rounded-full"
                    style={{
                      background: 'hsl(var(--gold))',
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                    }}
                    ref={el => {
                      // Pure CSS hover handled via card-hover class on parent
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING
      ════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{
          background: 'hsl(var(--navy-deep))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 85% 50% / 0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="container relative">

          {/* Section header */}
          <div className="text-center mb-14">
            <span
              className="inline-flex items-center text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-4"
              style={{
                color: 'hsl(var(--gold))',
                background: 'hsl(var(--gold) / 0.08)',
                border: '1px solid hsl(var(--gold) / 0.2)',
              }}
            >
              {lang === 'ar' ? 'خطط الأسعار' : 'Pricing'}
            </span>
            <h2
              className="mt-4"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 600,
                color: 'hsl(var(--cream))',
                lineHeight: 1.15,
              }}
            >
              {t('pricing.title')}
            </h2>

            {/* Annual toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span
                className="text-sm font-medium"
                style={{ color: !annual ? 'hsl(var(--cream))' : 'hsl(var(--cream) / 0.45)' }}
              >
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className="relative h-6 w-11 rounded-full transition-colors duration-200"
                style={{ background: annual ? 'hsl(var(--gold))' : 'hsl(var(--cream) / 0.15)' }}
                aria-label="Toggle annual billing"
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200"
                  style={{
                    background: annual ? 'hsl(var(--navy-deep))' : 'white',
                    left: annual ? 'calc(100% - 1.375rem)' : '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
              <span
                className="text-sm font-medium"
                style={{ color: annual ? 'hsl(var(--cream))' : 'hsl(var(--cream) / 0.45)' }}
              >
                {t('pricing.annual')}
                {annual && (
                  <span
                    className="ms-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'hsl(var(--gold) / 0.2)', color: 'hsl(var(--gold))' }}
                  >
                    {lang === 'ar' ? 'وفّر ٢٠٪' : 'Save 20%'}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <PricingCard
              name={t('pricing.free.name')}
              price={t('pricing.free.price')}
              currency={t('pricing.currency')}
              perMonth={t('pricing.perMonth')}
              features={t('pricing.free.features') as any as string[]}
              cta={t('pricing.startFree')}
              highlighted={false}
              lang={lang}
            />
            <PricingCard
              name={t('pricing.researcher.name')}
              price={annual ? t('pricing.researcher.priceAnnual') : t('pricing.researcher.price')}
              currency={t('pricing.currency')}
              perMonth={t('pricing.perMonth')}
              features={t('pricing.researcher.features') as any as string[]}
              cta={t('pricing.subscribe')}
              highlighted={true}
              badge={annual ? t('pricing.researcher.badge') : undefined}
              lang={lang}
            />
            <PricingCard
              name={t('pricing.institution.name')}
              price={annual ? t('pricing.institution.priceAnnual') : t('pricing.institution.price')}
              currency={t('pricing.currency')}
              perMonth={t('pricing.perMonth')}
              features={t('pricing.institution.features') as any as string[]}
              cta={t('pricing.contactUs')}
              highlighted={false}
              badge={annual ? t('pricing.institution.badge') : undefined}
              lang={lang}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer
        style={{
          background: 'hsl(var(--navy-deep))',
          borderTop: '1px solid hsl(var(--cream) / 0.06)',
          padding: '2rem 0',
        }}
      >
        <div className="divider-gold mx-auto max-w-xs mb-6" />
        <div className="container text-center">
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.1rem',
              color: 'hsl(var(--gold))',
              marginBottom: '0.5rem',
            }}
          >
            Co-research
          </p>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--cream) / 0.35)', letterSpacing: '0.04em' }}>
            © 2025 Co-research.{' '}
            {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────────── */
const PricingCard: React.FC<{
  name: string;
  price: string;
  currency: string;
  perMonth: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
  lang: string;
}> = ({ name, price, currency, perMonth, features, cta, highlighted, badge, lang }) => (
  <div
    className="relative rounded-xl p-7 flex flex-col transition-transform duration-300 hover:-translate-y-1"
    style={
      highlighted
        ? {
            background: 'white',
            border: '1.5px solid hsl(var(--gold) / 0.5)',
            boxShadow: '0 8px 40px hsl(0 0% 0% / 0.25), 0 2px 8px hsl(42 85% 50% / 0.2)',
          }
        : {
            background: 'hsl(var(--cream) / 0.04)',
            border: '1px solid hsl(var(--cream) / 0.1)',
          }
    }
  >
    {/* Top gold bar for highlighted */}
    {highlighted && (
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)' }}
      />
    )}

    {badge && (
      <span
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
        style={{
          background: 'hsl(var(--gold))',
          color: 'hsl(var(--navy-deep))',
          boxShadow: '0 2px 8px hsl(var(--gold) / 0.4)',
        }}
      >
        {badge}
      </span>
    )}

    <h3
      className="mb-1"
      style={{
        fontSize: '0.8125rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: highlighted ? 'hsl(var(--gold))' : 'hsl(var(--cream) / 0.5)',
      }}
    >
      {name}
    </h3>

    <div className="mb-6 mt-2">
      <span
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '3rem',
          fontWeight: 700,
          lineHeight: 1,
          color: highlighted ? 'hsl(var(--navy-deep))' : 'hsl(var(--cream))',
        }}
      >
        {price}
      </span>
      <span
        className="ms-1 text-sm"
        style={{ color: highlighted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--cream) / 0.4)' }}
      >
        {currency}{perMonth}
      </span>
    </div>

    <ul className="space-y-3 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <div
            className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
            style={{
              background: highlighted ? 'hsl(var(--gold-muted))' : 'hsl(var(--cream) / 0.08)',
            }}
          >
            <Check
              className="h-2.5 w-2.5"
              style={{ color: highlighted ? 'hsl(36 60% 32%)' : 'hsl(var(--gold))' }}
            />
          </div>
          <span style={{ color: highlighted ? 'hsl(var(--navy))' : 'hsl(var(--cream) / 0.7)' }}>
            {f}
          </span>
        </li>
      ))}
    </ul>

    <button
      className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200"
      style={
        highlighted
          ? {
              background: 'hsl(var(--navy-deep))',
              color: 'hsl(var(--cream))',
              border: 'none',
            }
          : {
              background: 'transparent',
              color: 'hsl(var(--cream) / 0.8)',
              border: '1.5px solid hsl(var(--cream) / 0.2)',
            }
      }
      onMouseEnter={e => {
        if (highlighted) {
          (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--navy))';
        } else {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--cream) / 0.5)';
          (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--cream))';
        }
      }}
      onMouseLeave={e => {
        if (highlighted) {
          (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--navy-deep))';
        } else {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--cream) / 0.2)';
          (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--cream) / 0.8)';
        }
      }}
    >
      {cta}
    </button>
  </div>
);

export default LandingPage;