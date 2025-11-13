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
  variant = 'light',
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

  const isDark = variant === 'dark';

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div
        className={`flex border-b ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === tab.id
                ? isDark
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-900 border-b-2 border-gray-900'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
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
