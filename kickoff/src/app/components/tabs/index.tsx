'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useRef } from 'react';

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
  ariaLabel?: string;
}

/**
 * URL-driven tab strip with full ARIA tab semantics (roving tabindex, arrow
 * key navigation). The active tab lives in a query param — the URL is the
 * single source of truth, so tabs are linkable and survive reloads.
 */
export function Tabs({
  tabs,
  defaultTab,
  className = '',
  queryParam = 'tab',
  ariaLabel = 'Flikar',
}: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const fallbackTab = defaultTab || tabs[0]?.id || '';
  const tabFromUrl = searchParams.get(queryParam);
  const activeTab =
    tabFromUrl && tabs.some((tab) => tab.id === tabFromUrl)
      ? tabFromUrl
      : fallbackTab;

  const activateTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === fallbackTab) {
      params.delete(queryParam);
    } else {
      params.set(queryParam, tabId);
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft')
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    activateTab(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex border-b border-line overflow-x-auto"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={`${queryParam}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${queryParam}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => activateTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`display px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] whitespace-nowrap transition-colors cursor-pointer border-b-[3px] -mb-px ${
                isActive
                  ? 'text-ink border-accent'
                  : 'text-mute border-transparent hover:text-soft'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${queryParam}-panel-${activeTab}`}
        aria-labelledby={`${queryParam}-tab-${activeTab}`}
        className="mt-4"
      >
        {activeTabContent}
      </div>
    </div>
  );
}
