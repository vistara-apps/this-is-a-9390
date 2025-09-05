import React, { useState } from 'react';

const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'default',
  className = '' 
}) => {
  const baseClasses = 'flex border-b border-gray-700';
  const tabBaseClasses = 'px-4 py-2 font-medium text-sm transition-colors duration-150 cursor-pointer';
  
  const getTabClasses = (tabId, isActive) => {
    const activeClasses = isActive 
      ? 'text-primary border-b-2 border-primary' 
      : 'text-text-secondary hover:text-text-primary';
    
    return `${tabBaseClasses} ${activeClasses}`;
  };

  return (
    <div className={`${baseClasses} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={getTabClasses(tab.id, activeTab === tab.id)}
          onClick={() => onTabChange(tab.id)}
          disabled={tab.disabled}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span className="ml-2 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
