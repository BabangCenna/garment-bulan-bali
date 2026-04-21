'use client'
import { useState } from 'react'

const Tabs = ({
  tabs      = [], // [{ key, label, icon, badge, disabled, content }]
  defaultTab,
  variant   = 'line',    // 'line' | 'pills' | 'boxed'
  size      = 'md',      // 'sm' | 'md' | 'lg'
  alignment = 'left',    // 'left' | 'center' | 'right' | 'stretch'
  onChange,
  className = '',
}) => {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key)

  const select = (key) => {
    setActive(key)
    onChange?.(key)
  }

  const activeTab = tabs.find(t => t.key === active)

  return (
    <div className={['tabs', className].filter(Boolean).join(' ')}>
      <div className={[
        'tabs-nav',
        `tabs-nav-${variant}`,
        `tabs-nav-${alignment}`,
        `tabs-nav-${size}`,
      ].join(' ')}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && select(tab.key)}
            className={[
              'tabs-tab',
              `tabs-tab-${variant}`,
              active === tab.key ? 'tabs-tab-active' : '',
              tab.disabled ? 'tabs-tab-disabled' : '',
            ].filter(Boolean).join(' ')}
          >
            {tab.icon && <span className="tabs-tab-icon">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="tabs-tab-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      {activeTab?.content && (
        <div className="tabs-panel">{activeTab.content}</div>
      )}
    </div>
  )
}

export default Tabs