'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { Menu, X, Activity, Globe, LogOut, User, WifiOff } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Poll or check current user login status
  useEffect(() => {
    const checkUser = async () => {
      const userV2 = await db.getCurrentUserV2();
      if (userV2) {
        setCurrentUser({ ...userV2, full_name: userV2.name || userV2.id });
      } else {
        const user = await db.getCurrentUser();
        setCurrentUser(user);
      }
    };
    checkUser();
    
    // Add custom event listener for storage changes to instantly update user badge
    const handleStorageChange = () => {
      checkUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Polling as a fallback for transitions within single-page navigation
    const interval = setInterval(checkUser, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await db.logout();
    setCurrentUser(null);
    setIsOpen(false);
    router.push('/login');
  };

  // Do not display navbar on login screen or landing page if we want, but wait,
  // showing it everywhere is very useful, especially for bilingual toggle on login!
  // If we are on /login, we should hide menu links but keep the logo and language toggle.
  const isLoginPage = pathname === '/login';

  const navItems = [
    { name: t('nav_dashboard'), path: '/dashboard' },
    { name: t('nav_assessment'), path: '/assessment' },
    { name: t('nav_chatbot'), path: '/chatbot' },
    { name: t('nav_hospitals'), path: '/hospitals' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-teal-600 font-bold text-xl tracking-wide">
              <Activity className="h-6 w-6 text-teal-600 animate-pulse" />
              <span>{t('nav_brand')}</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {!isLoginPage && currentUser && (
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Controls: Language, Profile, Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Offline Database Badge */}
            {db.isOffline && (
              <span className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                <WifiOff className="h-3 w-3" />
                <span>{t('nav_offline')}</span>
              </span>
            )}

            {/* Global Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer min-h-[40px] md:min-h-0"
              title="Switch Language / ಭಾಷೆಯನ್ನು ಬದಲಿಸಿ"
              aria-label="Switch Language"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Profile Info and Logout */}
            {!isLoginPage && currentUser ? (
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t('nav_logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              !isLoginPage && (
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )
            )}

            {/* Mobile Menu Toggle Button */}
            {!isLoginPage && currentUser && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex md:hidden p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors min-w-[40px] min-h-[40px] items-center justify-center"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && !isLoginPage && currentUser && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          {/* Mobile Profile & Logout */}
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3 px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{currentUser.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
              </div>
            </div>
            
            {db.isOffline && (
              <div className="px-4 py-1.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-amber-100">
                <WifiOff className="h-3.5 w-3.5" />
                <span>{t('nav_offline')}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>{t('nav_logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
