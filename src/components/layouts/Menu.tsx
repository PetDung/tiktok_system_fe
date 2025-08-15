import { useState } from "react";
import { useRouter } from "next/navigation";
export interface MenuItem {
  id: number;
  title: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  hfref?: string; // Optional href for direct navigation
}

export function Menu({ items, collapsed }: { items: MenuItem[]; collapsed: boolean }) {
  return (
    <ul className="p-2 space-y-1">
      {items.map((item) => (
        <MenuItemComponent key={item.id} item={item} collapsed={collapsed} />
      ))}
    </ul>
  );
}

function MenuItemComponent({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {

  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleClick = (item: MenuItem) => {
    if( item.children) {
      setOpen(!open);
    } else {
      if(item.hfref){
        router.push(item.hfref);
      }
    }
  };



  return (
    <li>
      <button
        onClick={() => handleClick(item)}
        className="flex items-center w-full px-2 py-2 rounded hover:bg-gray-700"
      >
        {/* ICON */}
        <span className="mr-2">{item.icon || "📁"}</span>

        {/* TEXT */}
        {!collapsed && <span className="flex-1 text-left">{item.title}</span>}

        {/* CHEVRON */}
        {!collapsed && item.children && <span>{open ? "▼" : "▶"}</span>}
      </button>

      {/* SUBMENU */}
      {item.children && open && (
        <ul className={`pl-6 ${collapsed ? "hidden" : ""}`}>
          {item.children.map((child) => (
            <MenuItemComponent key={child.id} item={child} collapsed={collapsed} />
          ))}
        </ul>
      )}
    </li>
  );
}
