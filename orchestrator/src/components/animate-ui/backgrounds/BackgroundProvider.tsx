'use client';

import * as React from 'react';
import { StarsBackground } from '../components/backgrounds/stars';
import { BubbleBackground } from '../components/backgrounds/bubble';
import { GradientBackground } from '../components/backgrounds/gradient';
import { GravityStarsBackground } from '../components/backgrounds/gravity-stars';
import { HoleBackground } from '../components/backgrounds/hole';
import { useDisplaySettings } from '@/components/display';
import { cn } from '@/lib/utils';

export type BackgroundType = 'stars' | 'bubble' | 'gradient' | 'gravity-stars' | 'hole' | 'aurora' | 'none';

export interface BackgroundSettings {
  type: BackgroundType;
  primaryColor?: string;
  secondaryColor?: string;
  speed?: number;
  interactive?: boolean;
}

interface BackgroundContextValue {
  settings: BackgroundSettings;
  setSettings: (settings: BackgroundSettings) => void;
  setBackgroundType: (type: BackgroundType) => void;
}

const BackgroundContext = React.createContext<BackgroundContextValue | null>(null);

export function useBackground() {
  const context = React.useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}

const defaultSettings: BackgroundSettings = {
  type: 'aurora',
  speed: 50,
  interactive: true,
};

interface BackgroundProviderProps {
  children: React.ReactNode;
  initialSettings?: BackgroundSettings;
  storageKey?: string;
}

export function BackgroundProvider({
  children,
  initialSettings = defaultSettings,
  storageKey = 'elmer-background-settings',
}: BackgroundProviderProps) {
  const [settings, setSettingsState] = React.useState<BackgroundSettings>(initialSettings);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettingsState({ ...defaultSettings, ...parsed });
      }
    } catch (e) {
      console.warn('Failed to load background settings from localStorage:', e);
    }
  }, [storageKey]);

  // Save settings to localStorage when they change
  const setSettings = React.useCallback(
    (newSettings: BackgroundSettings) => {
      setSettingsState(newSettings);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (e) {
        console.warn('Failed to save background settings to localStorage:', e);
      }
    },
    [storageKey]
  );

  const setBackgroundType = React.useCallback(
    (type: BackgroundType) => {
      setSettings({ ...settings, type });
    },
    [settings, setSettings]
  );

  const value = React.useMemo(
    () => ({ settings, setSettings, setBackgroundType }),
    [settings, setSettings, setBackgroundType]
  );

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

interface AnimatedBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

// Helper to parse RGB color string to tuple
function parseRGB(color: string): [number, number, number] {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }
  // Handle rgb(r, g, b) format
  const match = color.match(/(\d+),?\s*(\d+),?\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [255, 255, 255];
}

export function AnimatedBackground({ className, children }: AnimatedBackgroundProps) {
  const { settings } = useBackground();

  // Render the appropriate background based on settings
  switch (settings.type) {
    case 'stars':
      return (
        <StarsBackground
          className={className}
          speed={settings.speed || 50}
          starColor={settings.primaryColor || '#fff'}
          pointerEvents={false}
        >
          {children}
        </StarsBackground>
      );
    case 'bubble':
      return (
        <BubbleBackground
          className={className}
          interactive={settings.interactive}
          colors={
            settings.primaryColor
              ? {
                  first: settings.primaryColor,
                  second: settings.secondaryColor || '221,74,255',
                  third: '0,220,255',
                  fourth: '200,50,50',
                  fifth: '180,180,50',
                  sixth: '140,100,255',
                }
              : undefined
          }
        >
          {children}
        </BubbleBackground>
      );
    case 'gradient':
      return (
        <GradientBackground className={className}>
          {children}
        </GradientBackground>
      );
    case 'gravity-stars':
      return (
        <GravityStarsBackground
          className={className}
          movementSpeed={settings.speed ? settings.speed / 100 : 0.3}
          starColor={settings.primaryColor || '#fff'}
          mouseGravity={settings.interactive ? 'attract' : 'repel'}
        >
          {children}
        </GravityStarsBackground>
      );
    case 'hole':
      return (
        <HoleBackground
          className={className}
          strokeColor={settings.primaryColor || '#737373'}
          particleRGBColor={settings.secondaryColor ? parseRGB(settings.secondaryColor) : [255, 255, 255]}
        >
          {children}
        </HoleBackground>
      );
    case 'aurora':
      // Use existing aurora background from globals.css
      return (
        <div className={className}>
          <div className="aurora-bg" />
          {children}
        </div>
      );
    case 'none':
    default:
      return <div className={className}>{children}</div>;
  }
}

// Export a simple background wrapper for pages that don't need the full provider
export function BackgroundWrapper({
  type,
  children,
  className,
  primaryColor,
  secondaryColor,
  ...props
}: {
  type: BackgroundType;
  children?: React.ReactNode;
  className?: string;
  speed?: number;
  interactive?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const { isFocusMode } = useDisplaySettings();
  
  // In focus mode, render a simple solid background (CSS handles colors)
  // This improves performance by not rendering complex animated backgrounds
  if (isFocusMode) {
    return (
      <div className={cn(
        className,
        "bg-slate-50 dark:bg-zinc-950 transition-colors duration-200"
      )}>
        {children}
      </div>
    );
  }
  
  switch (type) {
    case 'stars':
      return (
        <StarsBackground className={className} pointerEvents={false} {...props}>
          {children}
        </StarsBackground>
      );
    case 'bubble':
      return (
        <BubbleBackground className={className} {...props}>
          {children}
        </BubbleBackground>
      );
    case 'gradient':
      return (
        <GradientBackground className={className}>
          {children}
        </GradientBackground>
      );
    case 'gravity-stars':
      return (
        <GravityStarsBackground
          className={className}
          starColor={primaryColor || '#fff'}
          {...props}
        >
          {children}
        </GravityStarsBackground>
      );
    case 'hole':
      return (
        <HoleBackground
          className={className}
          strokeColor={primaryColor || '#737373'}
          particleRGBColor={secondaryColor ? parseRGB(secondaryColor) : [255, 255, 255]}
        >
          {children}
        </HoleBackground>
      );
    case 'aurora':
      return (
        <div className={className}>
          <div className="aurora-bg" />
          {children}
        </div>
      );
    case 'none':
    default:
      return <div className={className}>{children}</div>;
  }
}
