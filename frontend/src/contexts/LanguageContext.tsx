'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Placeholder translations - these would be loaded from JSON files in a real implementation
const translations = {
  en: {
    common: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      insights: 'Insights',
      settings: 'Settings',
      logout: 'Logout',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import'
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      loginSuccess: 'Login successful',
      loginError: 'Login failed'
    },
    dashboard: {
      title: 'BiteBase Intelligence',
      subtitle: 'Restaurant Analytics & Business Intelligence',
      welcomeBack: 'Welcome back',
      totalRevenue: 'Total Revenue',
      totalOrders: 'Total Orders',
      avgOrderValue: 'Average Order Value',
      customerSatisfaction: 'Customer Satisfaction'
    }
  },
  th: {
    common: {
      dashboard: 'แดชบอร์ด',
      analytics: 'การวิเคราะห์',
      insights: 'ข้อมูลเชิงลึก',
      settings: 'การตั้งค่า',
      logout: 'ออกจากระบบ',
      loading: 'กำลังโหลด...',
      error: 'ข้อผิดพลาด',
      success: 'สำเร็จ',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      delete: 'ลบ',
      edit: 'แก้ไข',
      create: 'สร้าง',
      search: 'ค้นหา',
      filter: 'กรอง',
      export: 'ส่งออก',
      import: 'นำเข้า'
    },
    auth: {
      signIn: 'เข้าสู่ระบบ',
      signUp: 'สมัครสมาชิก',
      signOut: 'ออกจากระบบ',
      email: 'อีเมล',
      password: 'รหัสผ่าน',
      forgotPassword: 'ลืมรหัสผ่าน?',
      loginSuccess: 'เข้าสู่ระบบสำเร็จ',
      loginError: 'เข้าสู่ระบบไม่สำเร็จ'
    },
    dashboard: {
      title: 'BiteBase Intelligence',
      subtitle: 'การวิเคราะห์ร้านอาหารและธุรกิจอัจฉริยะ',
      welcomeBack: 'ยินดีต้อนรับกลับ',
      totalRevenue: 'รายได้รวม',
      totalOrders: 'จำนวนออเดอร์',
      avgOrderValue: 'มูลค่าออเดอร์เฉลี่ย',
      customerSatisfaction: 'ความพึงพอใจลูกค้า'
    }
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'th')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Handle interpolation
    if (params && typeof result === 'string') {
      Object.keys(params).forEach(param => {
        result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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