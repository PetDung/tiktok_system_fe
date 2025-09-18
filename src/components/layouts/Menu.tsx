"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface MenuItem {
  id: number;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  href?: string;
  badge?: string; // Badge for notifications
  disabled?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  collapsed: boolean;
  onItemClick?: () => void;
}

export function Menu({ items, collapsed, onItemClick }: MenuProps) {
  return (
    <div className="p-3">
      {!collapsed && (
        <div className="mb-6 px-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Menu
          </h2>
        </div>
      )}
      
      <nav>
        <ul className="space-y-1">
          {items.map((item) => (
            <MenuItemComponent 
              key={item.id} 
              item={item} 
              collapsed={collapsed}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

function MenuItemComponent({ 
  item, 
  collapsed, 
  onItemClick,
  level = 0 
}: { 
  item: MenuItem; 
  collapsed: boolean;
  onItemClick?: () => void;
  level?: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current item is active
  const isActive = item.href === pathname;
  
  // Check if any child is active (recursive)
  const hasActiveChild = (menuItem: MenuItem): boolean => {
    if (menuItem.href === pathname) return true;
    return menuItem.children?.some(hasActiveChild) || false;
  };

  const hasActiveDescendant = item.children ? hasActiveChild(item) : false;

  // Auto-expand if has active child
  useEffect(() => {
    if (hasActiveDescendant && !collapsed) {
      setOpen(true);
    }
  }, [pathname, hasActiveDescendant, collapsed]);

  // Close submenu when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setOpen(false);
    }
  }, [collapsed]);

  const handleClick = () => {
    if (item.disabled) return;
    
    if (item.children && !collapsed) {
      setOpen(!open);
    } else if (item.href) {
      router.push(item.href);
      onItemClick?.();
    }
  };

  const getItemClasses = () => {
    const baseClasses = "group relative flex items-center w-full rounded-lg transition-all duration-200";
    const paddingClasses = collapsed ? "p-2 justify-center" : `px-3 py-2.5 ${level > 0 ? `ml-${level * 2}` : ''}`;
    
    if (item.disabled) {
      return `${baseClasses} ${paddingClasses} text-gray-100 cursor-not-allowed opacity-50`;
    }
    
    if (isActive) {
      return `${baseClasses} ${paddingClasses} bg-orange-300 text-white shadow-lg`;
    }
    
    if (hasActiveDescendant) {
      return `${baseClasses} ${paddingClasses} bg-gray-700 text-blue-300`;
    }
    
    return `${baseClasses} ${paddingClasses} text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600`;
  };

  return (
    <li>
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={getItemClasses()}
        title={collapsed ? item.title : undefined}
      >
        {/* Icon */}
        <div className={`flex items-center justify-center ${collapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} flex-shrink-0`}>
          {item.icon || (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {/* Title and Badge */}
        {!collapsed && (
          <>
            <span className="flex-1 text-left font-medium truncate">
              {item.title}
            </span>
            
            {/* Badge */}
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
            
            {/* Expand/Collapse Icon */}
            {item.children && (
              <svg 
                className={`ml-2 w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </>
        )}

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-r-full" />
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="group-hover:opacity-100 opacity-0 absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50 transition-opacity duration-200 pointer-events-none">
          {item.title}
          {item.badge && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      )}

      {/* Submenu */}
      {item.children && open && !collapsed && (
        <ul className="mt-1 space-y-1 pl-1 border-l border-gray-600">
          {item.children.map((child) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}