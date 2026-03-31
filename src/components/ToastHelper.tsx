import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const ToastHelper: React.FC = () => null;

export const showToast = (message: string) => {
  toast(message, {
    position: 'top-right',
    duration: 3000,
  });
};

export default ToastHelper;
