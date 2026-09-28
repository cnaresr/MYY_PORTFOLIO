import React from 'react';

export interface TreeNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface TreeNavGroup {
  section: string;
  items: TreeNavItem[];
}

/**
 * TreeNav — admin sidebar *tree* navigation (dark cockpit theme).
 *
 * Keeps the item/active/badge API, renders as a real tree — a vertical
 * connector rail with a node dot per branch — using the cockpit palette
 * (deep navy surfaces, emerald active accent, Space Grotesk labels).
 */
export const TreeNav: React.FC<{
  groups: TreeNavGroup[];
  activeId?: string;
  className?: string;
}> = ({ groups, activeId, className = '' }) => {
  return (
    <nav className={`px-3 mt-3 select-none ${className}`}>
      {groups.map((group, gi) => (
        <div key={group.section} className={gi > 0 ? 'mt-5' : ''}>
          {/* Group label with a leading tree glyph */}
          <div className="flex items-center gap-2 px-3 mb-2" data-treenav-header>
            <span className="w-1 h-1 rounded-full bg-cockpit-line-strong" />
            <span className="font-['Space_Grotesk'] text-[10px] font-bold text-cockpit-muted uppercase tracking-widest">
              {group.section}
            </span>
            <span className="flex-1 h-px bg-cockpit-line" />
          </div>

          {/* Tree branches */}
          <ul className="relative pl-4">
            {/* vertical connector rail */}
            <span
              aria-hidden="true"
              className="absolute left-[7px] top-1 bottom-1 w-px bg-cockpit-line"
            />
            {group.items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id} className="relative">
                  {/* horizontal elbow into the rail */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-[-9px] top-1/2 -translate-y-1/2 h-px w-2 ${
                      isActive ? 'bg-emerald-400/60' : 'bg-cockpit-line'
                    }`}
                  />
                  {/* node dot on the rail */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-[-12px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full border transition-colors ${
                      isActive
                        ? 'bg-emerald-400 border-emerald-400 ring-2 ring-emerald-400/20'
                        : 'bg-cockpit-raised border-cockpit-line-strong'
                    }`}
                  />
                  <a
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold ring-1 ring-emerald-500/30'
                        : 'text-cockpit-muted hover:text-cockpit-text hover:bg-cockpit-hover'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      {item.icon && (
                        <span
                          className={`material-symbols-outlined text-[17px] shrink-0 ${
                            isActive ? 'text-emerald-300' : 'text-cockpit-faint'
                          }`}
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                          isActive ? 'bg-emerald-400/20 text-emerald-300' : 'bg-cockpit-raised text-cockpit-muted'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};
