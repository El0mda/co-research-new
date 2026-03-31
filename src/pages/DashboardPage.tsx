import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { showToast } from '@/components/ToastHelper';
import { Plus, Search, Users, Calendar } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { t, lang } = useLang();
  const { allProjects, user, allResearchers } = useApp();
  const [tab, setTab] = useState<'mine' | 'discover'>('mine');
  const [search, setSearch] = useState('');
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  const myProjects = allProjects.filter(p => p.members.includes(user.id));
  const discoverProjects = allProjects.filter(p => !p.members.includes(user.id) && p.status !== 'final');
  const filtered = discoverProjects.filter(p => {
    const title = lang === 'ar' ? p.title : p.titleEn;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea': return 'bg-blue-500/10 text-blue-400';
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-400';
      case 'final': return 'bg-green-500/10 text-green-400';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">{t('dashboard.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'mine' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('dashboard.myTeams')}
          </button>
          <button
            onClick={() => setTab('discover')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'discover' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('dashboard.discover')}
          </button>
        </div>

        {tab === 'mine' ? (
          <div>
            {myProjects.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold mb-2">{t('dashboard.noTeams')}</h3>
                <p className="text-muted-foreground text-sm">{t('dashboard.noTeamsDesc')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myProjects.map(p => (
                  <Link
                    key={p.id}
                    to={`/team/${p.id}`}
                    className="rounded-xl border border-border bg-card p-5 card-hover block"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                        {t(`dashboard.status.${p.status}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.completion}% {t('dashboard.completion')}</span>
                    </div>
                    <h3 className="font-heading font-semibold mb-1 line-clamp-2">{lang === 'ar' ? p.title : p.titleEn}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{lang === 'ar' ? p.field : p.fieldEn}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {p.members.length}/{p.maxMembers} {t('dashboard.members')}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.completion}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <button className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              {t('dashboard.createTeam')}
            </button>
          </div>
        ) : (
          <div>
            <div className="relative mb-6">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="form-input ps-10"
                placeholder={t('dashboard.search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold">{t('dashboard.noResults')}</h3>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(p => {
                  const slotsAvailable = p.maxMembers - p.members.length;
                  const joined = joinedIds.includes(p.id);
                  return (
                    <div key={p.id} className="rounded-xl border border-border bg-card p-5 card-hover">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                          {t(`dashboard.status.${p.status}`)}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                          {t(`dashboard.type.${p.type}`)}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold mb-1 line-clamp-2">{lang === 'ar' ? p.title : p.titleEn}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{lang === 'ar' ? p.field : p.fieldEn} · {lang === 'ar' ? p.subField : p.subFieldEn}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(lang === 'ar' ? p.interests : p.interestsEn).slice(0, 3).map(tag => (
                          <span key={tag} className="rounded-full bg-gold-subtle px-2 py-0.5 text-xs text-primary">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {p.startDate} → {p.endDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {slotsAvailable} {t('dashboard.slots')}
                        </span>
                        <button
                          disabled={joined}
                          onClick={() => { setJoinedIds([...joinedIds, p.id]); showToast(t('toast.requestSent')); }}
                          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            joined
                              ? 'bg-secondary text-muted-foreground cursor-default'
                              : 'bg-primary text-primary-foreground hover:opacity-90'
                          }`}
                        >
                          {joined ? t('dashboard.requestSent') : t('dashboard.requestJoin')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
