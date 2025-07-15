import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { timezones, getTimezoneDisplayName, getIANATimezone } from '@shared/schema';

interface TimezoneContextType {
  userTimezone: string;
  setUserTimezone: (timezone: string) => void;
  convertToUserTimezone: (date: Date | string) => Date;
  formatDateTime: (date: Date | string, timezone?: string) => string;
  getTimezoneOptions: () => Array<{ value: string; label: string }>;
  getIANATimezone: (timezoneCode: string) => string;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userTimezone, setUserTimezone] = useState(user?.timezone || 'UTC');

  useEffect(() => {
    if (user?.timezone) {
      setUserTimezone(user.timezone);
    }
  }, [user?.timezone]);

  const convertToUserTimezone = (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const ianaTimezone = getIANATimezone(userTimezone);
    return new Date(dateObj.toLocaleString('en-US', { timeZone: ianaTimezone }));
  };

  const formatDateTime = (date: Date | string, timezone?: string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const targetTimezone = timezone || userTimezone;
    const ianaTimezone = getIANATimezone(targetTimezone);
    
    return dateObj.toLocaleString('en-US', {
      timeZone: ianaTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimezoneOptions = () => {
    return timezones.map(tz => ({
      value: tz,
      label: getTimezoneDisplayName(tz)
    }));
  };

  const getIANATimezone = (timezoneCode: string): string => {
    const timezoneMap: Record<string, string> = {
      'UTC': 'UTC',
      'GMT': 'GMT',
      'EST': 'America/New_York',
      'CST': 'America/Chicago',
      'MST': 'America/Denver',
      'PST': 'America/Los_Angeles',
      'EAT': 'Africa/Nairobi',
      'CAT': 'Africa/Harare',
      'WAT': 'Africa/Lagos',
      'SAST': 'Africa/Johannesburg',
      'IST': 'Asia/Kolkata',
      'JST': 'Asia/Tokyo',
      'CST_CN': 'Asia/Shanghai',
      'AEST': 'Australia/Sydney',
      'NZST': 'Pacific/Auckland'
    };
    return timezoneMap[timezoneCode] || 'UTC';
  };

  const value: TimezoneContextType = {
    userTimezone,
    setUserTimezone,
    convertToUserTimezone,
    formatDateTime,
    getTimezoneOptions,
    getIANATimezone
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
} 