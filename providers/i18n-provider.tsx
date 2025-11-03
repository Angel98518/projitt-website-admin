'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/i18n/config';

interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>({
        code: 'en',
        name: 'English',
        shortName: 'EN',
        direction: 'ltr',
        flag: '/media/flags/united-states.svg'
    });

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        // Here you would typically also update cookies, localStorage, etc.
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}