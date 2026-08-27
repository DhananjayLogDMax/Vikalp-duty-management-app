import React from 'react';
import { 
  Shield, 
  Award, 
  GraduationCap, 
  HeartHandshake, 
  Sparkles,
  Users
} from 'lucide-react';
import { AppSettings } from '../types';

interface AppLogoProps {
  settings: AppSettings;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  settings, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-base sm:text-lg rounded-xl',
    lg: 'w-12 h-12 text-xl rounded-2xl',
    xl: 'w-16 h-16 text-2xl rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  // 1. Custom Image / Uploaded Logo
  if (settings.appLogoType === 'image' && settings.appLogoUrl) {
    return (
      <div 
        className={`${sizeClasses[size]} overflow-hidden border border-slate-200/80 bg-white shadow-xs flex items-center justify-center shrink-0 ${className}`}
      >
        <img 
          src={settings.appLogoUrl} 
          alt={settings.applicationName || 'App Logo'} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback if image fails to load
            (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // 2. Preset Badge Logos
  const preset = settings.appLogoPreset || 'default_v';
  
  if (preset === 'helping_hands') {
    return (
      <div className={`${sizeClasses[size]} bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs shadow-teal-700/20 shrink-0 ${className}`}>
        <HeartHandshake className={iconSizes[size]} />
      </div>
    );
  }

  if (preset === 'shield_guard') {
    return (
      <div className={`${sizeClasses[size]} bg-linear-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-xs shadow-blue-700/20 shrink-0 ${className}`}>
        <Shield className={iconSizes[size]} />
      </div>
    );
  }

  if (preset === 'star_trophy') {
    return (
      <div className={`${sizeClasses[size]} bg-linear-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs shadow-amber-600/20 shrink-0 ${className}`}>
        <Award className={iconSizes[size]} />
      </div>
    );
  }

  if (preset === 'academic_cap') {
    return (
      <div className={`${sizeClasses[size]} bg-linear-to-br from-sky-600 to-teal-700 text-white flex items-center justify-center shadow-xs shadow-sky-600/20 shrink-0 ${className}`}>
        <GraduationCap className={iconSizes[size]} />
      </div>
    );
  }

  if (preset === 'heart_hands') {
    return (
      <div className={`${sizeClasses[size]} bg-linear-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs shadow-rose-500/20 shrink-0 ${className}`}>
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  // Default: Signature "V" Teal Badge
  return (
    <div className={`${sizeClasses[size]} bg-teal-700 text-white flex items-center justify-center font-black tracking-tighter shadow-xs shadow-teal-700/20 shrink-0 ${className}`}>
      V
    </div>
  );
};
