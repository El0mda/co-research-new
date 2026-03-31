import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { showToast } from '@/components/ToastHelper';
import { ExternalLink, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { allResearchers, allProjects } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const researcher = allResearchers.find(r => r.id === id);
  if (!researcher) return <div className="min-h-screen bg-background"><Header /><div className="container py-20 text-center text-muted-foreground">Researcher not found</div></div>;

  const userProjects = allProjects.filter(p => p.members.includes(researcher.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-3xl py-12">
        <div className="rounded-xl border border-border bg-card p-8 text-center mb-8">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground mb-4">
            {(lang === 'ar' ? researcher.name : researcher.nameEn).charAt(0)}
          </div>
          <h1 className="font-heading text-2xl font-bold mb-1">{lang === 'ar' ? researcher.name : researcher.nameEn}</h1>
          <p className="text-sm text-muted-foreground mb-1">{lang === 'ar' ? researcher.degree : researcher.degreeEn} · {lang === 'ar' ? researcher.university : researcher.universityEn}</p>
          <p className="text-xs text-muted-foreground mb-4">{lang === 'ar' ? researcher.faculty : researcher.facultyEn}</p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {(lang === 'ar' ? researcher.interests : researcher.interestsEn).map(tag => (
              <span key={tag} className="rounded-full bg-gold-subtle px-3 py-1 text-xs text-primary">{tag}</span>
            ))}
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {researcher.orcid && (
              <a href={`https://orcid.org/${researcher.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
                ORCID <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {researcher.scholar && (
              <a href={researcher.scholar} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
                Google Scholar <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {researcher.scopus && (
              <a href={researcher.scopus} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
                Scopus <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {t('profile.inviteCollaborate')}
          </button>
        </div>

        {/* Teams */}
        <h2 className="font-heading text-lg font-semibold mb-4">{t('profile.teams')}</h2>
        {userProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('profile.noTeams')}</p>
        ) : (
          <div className="space-y-3">
            {userProjects.map(p => (
              <Link key={p.id} to={`/team/${p.id}`} className="block rounded-xl border border-border bg-card p-4 card-hover">
                <h3 className="font-medium text-sm mb-1">{lang === 'ar' ? p.title : p.titleEn}</h3>
                <p className="text-xs text-muted-foreground">{lang === 'ar' ? p.field : p.fieldEn} · {t(`dashboard.status.${p.status}`)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold">{t('profile.inviteTitle')}</h3>
              <button onClick={() => setInviteOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <label className="block text-sm font-medium mb-1.5">{t('profile.inviteMessage')}</label>
            <textarea
              className="form-input min-h-[100px] resize-none"
              value={inviteMsg}
              onChange={e => setInviteMsg(e.target.value)}
            />
            <button
              onClick={() => { showToast(t('toast.inviteSent')); setInviteOpen(false); setInviteMsg(''); }}
              className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t('profile.sendInvite')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
