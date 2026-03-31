import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Upload, X, Plus } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { t } = useLang();
  const { setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const steps = t('register.steps') as any as string[];

  // Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [field, setField] = useState('');
  const [subField, setSubField] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [degree, setDegree] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');

  // Step 3
  const [orcid, setOrcid] = useState('');
  const [scholar, setScholar] = useState('');
  const [scopus, setScopus] = useState('');

  // Step 4
  const [langPref, setLangPref] = useState<'ar' | 'en'>('ar');
  const [actionPref, setActionPref] = useState<'create' | 'find' | ''>('');

  const fields = t('register.fields') as any as string[];
  const degrees = t('register.degrees') as any as string[];

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!fullName.trim()) errs.fullName = t('register.errors.required');
      if (!email.trim()) errs.email = t('register.errors.required');
      else if (!/\.edu(\.[a-z]{2})?$/i.test(email)) errs.email = t('register.errors.invalidEmail');
      if (password.length < 8) errs.password = t('register.errors.passwordShort');
      if (password !== confirmPassword) errs.confirmPassword = t('register.errors.passwordMismatch');
      if (!agreeTerms) errs.agreeTerms = t('register.errors.agreeRequired');
    }
    if (s === 1) {
      if (!profilePhoto) errs.profilePhoto = t('register.errors.required');
      if (!idFront) errs.idFront = t('register.errors.required');
      if (!idBack) errs.idBack = t('register.errors.required');
      if (!field) errs.field = t('register.errors.required');
      if (!degree) errs.degree = t('register.errors.required');
      if (!university.trim()) errs.university = t('register.errors.required');
      if (!faculty.trim()) errs.faculty = t('register.errors.required');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) setStep(step + 1);
      else {
        setIsLoggedIn(true);
        navigate('/dashboard');
      }
    }
  };

  const handleFileUpload = (setter: (v: string) => void) => {
    setter('uploaded-placeholder');
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl py-12">
        <h1 className="font-heading text-3xl font-bold text-center mb-8">{t('register.title')}</h1>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <span className="mt-2 text-xs text-muted-foreground hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <FormField label={t('register.step1.fullName')} error={errors.fullName}>
              <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} />
            </FormField>
            <FormField label={t('register.step1.email')} error={errors.email} hint={t('register.step1.emailHint')}>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </FormField>
            <FormField label={t('register.step1.password')} error={errors.password}>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </FormField>
            <FormField label={t('register.step1.confirmPassword')} error={errors.confirmPassword}>
              <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </FormField>
            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                {t('register.step1.agreeTerms')}
              </label>
              {errors.agreeTerms && <p className="text-xs text-destructive mt-1">{errors.agreeTerms}</p>}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <UploadBox label={t('register.step2.profilePhoto')} value={profilePhoto} onUpload={() => handleFileUpload(setProfilePhoto)} error={errors.profilePhoto} />
              <UploadBox label={t('register.step2.idFront')} value={idFront} onUpload={() => handleFileUpload(setIdFront)} error={errors.idFront} />
              <UploadBox label={t('register.step2.idBack')} value={idBack} onUpload={() => handleFileUpload(setIdBack)} error={errors.idBack} />
            </div>
            <FormField label={t('register.step2.field')} error={errors.field}>
              <select className="form-input" value={field} onChange={e => setField(e.target.value)}>
                <option value=""></option>
                {fields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label={t('register.step2.subField')}>
              <input className="form-input" value={subField} onChange={e => setSubField(e.target.value)} />
            </FormField>
            <FormField label={t('register.step2.interests')} hint={t('register.step2.interestsHint')}>
              <div className="flex flex-wrap gap-2 mb-2">
                {interests.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gold-subtle px-3 py-1 text-xs text-primary">
                    {tag}
                    <button onClick={() => setInterests(interests.filter(i => i !== tag))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <input
                className="form-input"
                value={interestInput}
                onChange={e => setInterestInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
            </FormField>
            <FormField label={t('register.step2.degree')} error={errors.degree}>
              <select className="form-input" value={degree} onChange={e => setDegree(e.target.value)}>
                <option value=""></option>
                {degrees.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label={t('register.step2.university')} error={errors.university}>
              <input className="form-input" value={university} onChange={e => setUniversity(e.target.value)} />
            </FormField>
            <FormField label={t('register.step2.faculty')} error={errors.faculty}>
              <input className="form-input" value={faculty} onChange={e => setFaculty(e.target.value)} />
            </FormField>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground mb-4">{t('register.step3.optional')}</p>
            <FormField label={t('register.step3.orcid')}>
              <input className="form-input" value={orcid} onChange={e => setOrcid(e.target.value)} placeholder="0000-0000-0000-0000" />
            </FormField>
            <FormField label={t('register.step3.scholar')}>
              <input className="form-input" value={scholar} onChange={e => setScholar(e.target.value)} placeholder="https://scholar.google.com/..." />
            </FormField>
            <FormField label={t('register.step3.scopus')}>
              <input className="form-input" value={scopus} onChange={e => setScopus(e.target.value)} placeholder="https://www.scopus.com/..." />
            </FormField>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-3">{t('register.step4.langPref')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLangPref('ar')}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${langPref === 'ar' ? 'border-primary bg-gold-subtle' : 'border-border hover:border-muted-foreground'}`}
                >
                  <span className="text-2xl mb-2 block">🇸🇦</span>
                  <span className="font-semibold">{t('register.step4.arabic')}</span>
                </button>
                <button
                  onClick={() => setLangPref('en')}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${langPref === 'en' ? 'border-primary bg-gold-subtle' : 'border-border hover:border-muted-foreground'}`}
                >
                  <span className="text-2xl mb-2 block">🇺🇸</span>
                  <span className="font-semibold">{t('register.step4.english')}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">{t('register.step4.action')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActionPref('create')}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${actionPref === 'create' ? 'border-primary bg-gold-subtle' : 'border-border hover:border-muted-foreground'}`}
                >
                  <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <span className="font-semibold text-sm">{t('register.step4.createTeam')}</span>
                </button>
                <button
                  onClick={() => setActionPref('find')}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${actionPref === 'find' ? 'border-primary bg-gold-subtle' : 'border-border hover:border-muted-foreground'}`}
                >
                  <svg className="h-8 w-8 mx-auto mb-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <span className="font-semibold text-sm">{t('register.step4.findTeam')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
              {t('register.prev')}
            </button>
          ) : <div />}
          <button onClick={handleNext} className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            {step === 3 ? t('register.submit') : t('register.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; error?: string; hint?: string; children: React.ReactNode }> = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

const UploadBox: React.FC<{ label: string; value: string | null; onUpload: () => void; error?: string }> = ({ label, value, onUpload, error }) => (
  <div>
    <label className="block text-xs font-medium mb-1.5">{label}</label>
    <button
      onClick={onUpload}
      className={`flex h-28 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        value ? 'border-primary bg-gold-subtle' : error ? 'border-destructive' : 'border-border hover:border-muted-foreground'
      }`}
    >
      {value ? (
        <span className="text-xs text-primary font-medium">✓</span>
      ) : (
        <Upload className="h-6 w-6 text-muted-foreground" />
      )}
    </button>
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default RegisterPage;
