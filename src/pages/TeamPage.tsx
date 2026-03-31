import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { showToast } from '@/components/ToastHelper';
import { ChevronUp, ChevronDown, Plus, Paperclip, Send, FileText, AlertCircle } from 'lucide-react';

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { allProjects, allResearchers, setProjects } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [newMsg, setNewMsg] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const project = allProjects.find(p => p.id === id);
  if (!project) return <div className="min-h-screen bg-background"><Header /><div className="container py-20 text-center text-muted-foreground">Project not found</div></div>;

  const members = project.members.map(mId => allResearchers.find(r => r.id === mId)!).filter(Boolean);
  const tabs = [t('team.overview'), t('team.tasks'), t('team.discussions'), t('team.files')];

  const roles: Record<number, string> = { 0: 'firstAuthor', 1: 'coAuthor' };
  const getRole = (i: number) => {
    if (i === 0) return t('team.roles.firstAuthor');
    if (i === members.length - 1 && members.length > 1) return t('team.roles.lastAuthor');
    return t('team.roles.coAuthor');
  };

  const moveAuthor = (index: number, dir: -1 | 1) => {
    const newMembers = [...project.members];
    const target = index + dir;
    if (target < 0 || target >= newMembers.length) return;
    [newMembers[index], newMembers[target]] = [newMembers[target], newMembers[index]];
    setProjects(prev => prev.map(p => p.id === id ? { ...p, members: newMembers } : p));
  };

  const tasksByStatus = {
    'in-progress': project.tasks.filter(t => t.status === 'in-progress'),
    'under-review': project.tasks.filter(t => t.status === 'under-review'),
    'completed': project.tasks.filter(t => t.status === 'completed'),
  };

  const statusLabels: Record<string, string> = {
    'in-progress': t('team.inProgress'),
    'under-review': t('team.underReview'),
    'completed': t('team.completed'),
  };

  const statusColors: Record<string, string> = {
    'in-progress': 'border-yellow-500/30 bg-yellow-500/5',
    'under-review': 'border-green-500/30 bg-green-500/5',
    'completed': 'border-blue-500/30 bg-blue-500/5',
  };

  const statusDotColors: Record<string, string> = {
    'in-progress': 'bg-yellow-400',
    'under-review': 'bg-green-400',
    'completed': 'bg-blue-400',
  };

  const filesFromMessages = project.messages.filter(m => m.attachment).map(m => ({
    ...m.attachment!,
    uploadedBy: allResearchers.find(r => r.id === m.senderId),
    date: m.timestamp,
  }));

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    showToast(t('toast.taskUpdated'));
    setNewMsg('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-heading text-2xl font-bold mb-1">{lang === 'ar' ? project.title : project.titleEn}</h1>
        <p className="text-sm text-muted-foreground mb-6">{lang === 'ar' ? project.field : project.fieldEn} · {lang === 'ar' ? project.subField : project.subFieldEn}</p>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 0 && (
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{lang === 'ar' ? project.description : project.descriptionEn}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{t('common.from')}: {project.startDate}</span>
                <span>{t('common.to')}: {project.endDate}</span>
                <span>{t(`dashboard.type.${project.type}`)}</span>
                <span>{t(`dashboard.status.${project.status}`)}</span>
              </div>
            </div>

            {/* Members */}
            <div>
              <h2 className="font-heading text-lg font-semibold mb-4">{t('dashboard.members')}</h2>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {(lang === 'ar' ? m.name : m.nameEn).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{lang === 'ar' ? m.name : m.nameEn}</p>
                      <p className="text-xs text-muted-foreground">{getRole(i)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {project.tasks.filter(t => t.assigneeId === m.id).length} {t('team.tasks')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Author order */}
            <div>
              <h2 className="font-heading text-lg font-semibold mb-2">{t('team.authorOrder')}</h2>
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {t('team.authorNote')}
              </p>
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="text-sm font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium">{lang === 'ar' ? m.name : m.nameEn}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveAuthor(i, -1)} disabled={i === 0} className="rounded p-1 hover:bg-secondary disabled:opacity-30">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveAuthor(i, 1)} disabled={i === members.length - 1} className="rounded p-1 hover:bg-secondary disabled:opacity-30">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {activeTab === 1 && (
          <div>
            <button className="mb-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> {t('team.newTask')}
            </button>
            <div className="grid gap-6 md:grid-cols-3">
              {(['in-progress', 'under-review', 'completed'] as const).map(status => (
                <div key={status} className={`rounded-xl border p-4 ${statusColors[status]}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusDotColors[status]}`} />
                    <h3 className="text-sm font-semibold">{statusLabels[status]}</h3>
                    <span className="text-xs text-muted-foreground ms-auto">{tasksByStatus[status].length}</span>
                  </div>
                  <div className="space-y-3">
                    {tasksByStatus[status].map(task => {
                      const assignee = allResearchers.find(r => r.id === task.assigneeId);
                      return (
                        <div
                          key={task.id}
                          className="rounded-lg border border-border bg-card p-3 cursor-pointer card-hover"
                          onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        >
                          <h4 className="text-sm font-medium mb-1">{lang === 'ar' ? task.title : task.titleEn}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px]">
                                {assignee ? (lang === 'ar' ? assignee.name : assignee.nameEn).charAt(0) : '?'}
                              </div>
                              {assignee ? (lang === 'ar' ? assignee.name : assignee.nameEn).split(' ')[0] : ''}
                            </span>
                            <span>{task.dueDate}</span>
                          </div>
                          {expandedTask === task.id && (
                            <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                              {lang === 'ar' ? task.description : task.descriptionEn}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussions */}
        {activeTab === 2 && (
          <div>
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-gold-subtle p-3 text-xs text-primary">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {t('team.discussionNote')}
            </div>
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
              {project.messages.map(msg => {
                const sender = allResearchers.find(r => r.id === msg.senderId);
                return (
                  <div key={msg.id} className="flex gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                      {sender ? (lang === 'ar' ? sender.name : sender.nameEn).charAt(0) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{sender ? (lang === 'ar' ? sender.name : sender.nameEn) : '?'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{lang === 'ar' ? msg.text : msg.textEn}</p>
                      {msg.attachment && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs">
                          <FileText className="h-3.5 w-3.5" />
                          {msg.attachment.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-border p-2.5 hover:bg-secondary transition-colors">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                className="form-input flex-1"
                placeholder={t('team.sendMessage')}
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Files */}
        {activeTab === 3 && (
          <div>
            {filesFromMessages.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">{t('dashboard.noResults')}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-start p-3 font-medium">{t('team.fileName')}</th>
                      <th className="text-start p-3 font-medium">{t('team.uploadedBy')}</th>
                      <th className="text-start p-3 font-medium">{t('team.date')}</th>
                      <th className="text-start p-3 font-medium">{t('team.type')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filesFromMessages.map((f, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="p-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{f.name}</td>
                        <td className="p-3 text-muted-foreground">{f.uploadedBy ? (lang === 'ar' ? f.uploadedBy.name : f.uploadedBy.nameEn) : ''}</td>
                        <td className="p-3 text-muted-foreground">{new Date(f.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</td>
                        <td className="p-3 text-muted-foreground uppercase">{f.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
