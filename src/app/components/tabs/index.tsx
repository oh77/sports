'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  queryParam?: string;
  variant?: 'light' | 'dark';
}

export function Tabs({
  tabs,
  defaultTab,
  className = '',
  queryParam = 'tab',
}: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get(queryParam);

  // Determine active tab: URL param > defaultTab > first tab
  const getInitialTab = () => {
    if (tabFromUrl) {
      const tabExists = tabs.some((tab) => tab.id === tabFromUrl);
      if (tabExists) return tabFromUrl;
    }
    return defaultTab || tabs[0]?.id || '';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      const tabExists = tabs.some((tab) => tab.id === tabFromUrl);
      if (tabExists) {
        setActiveTab(tabFromUrl);
      }
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabFromUrl, defaultTab, tabs]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === (defaultTab || tabs[0]?.id)) {
      // Remove query param for default tab
      params.delete(queryParam);
    } else {
      params.set(queryParam, tabId);
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b border-line overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`display px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] whitespace-nowrap transition-colors cursor-pointer border-b-[3px] -mb-px ${
              activeTab === tab.id
                ? 'text-ink border-accent'
                : 'text-mute border-transparent hover:text-soft'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">{activeTabContent}</div>
    </div>
  );
}
