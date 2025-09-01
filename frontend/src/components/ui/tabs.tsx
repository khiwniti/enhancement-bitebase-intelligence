import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  value,
  onValueChange,
  children, 
  className = '', 
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '')
  
  const isControlled = value !== undefined
  const activeTab = isControlled ? value : internalActiveTab
  
  const setActiveTab = (newValue: string) => {
    if (isControlled) {
      onValueChange?.(newValue)
    } else {
      setInternalActiveTab(newValue)
    }
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div 
        className={className}
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!listRef.current) return;
    
    const tabs = listRef.current.querySelectorAll('[role="tab"]:not([disabled])');
    const currentIndex = Array.from(tabs).findIndex(tab => tab === document.activeElement);
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    (tabs[nextIndex] as HTMLElement)?.focus();
  };

  return (
    <div 
      ref={listRef}
      className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tabId = `tab-${value}`;
  const panelId = `tabpanel-${value}`;

  return (
    <button
      ref={buttonRef}
      id={tabId}
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { activeTab } = context
  const isActive = activeTab === value
  const tabId = `tab-${value}`;
  const panelId = `tabpanel-${value}`;
  
  return (
    <div 
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      className={`mt-2 ${className}`}
      hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {isActive && children}
    </div>
  )
}