import { MenuItem } from "./Menu";

export const menuData: MenuItem[] = [
  {
    id: 1,
    title: "Dashboard",
    icon: "📊",
  },
  {
    id: 2,
    title: "Products",
    icon: "📦",
    children: [
      { id: 21, title: "All Products", icon: "📄" },
      {
        id: 22,
        title: "Categories",
        icon: "🗂️",
        children: [
          { id: 221, title: "Clothes", icon: "👕" },
          { id: 222, title: "Electronics", icon: "💻" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Settings",
    icon: "⚙️",
  },
];
