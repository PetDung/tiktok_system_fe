import { Album, AlignStartHorizontal, CircleCheckBig, CircleX, LayoutDashboard, NotepadText, PackageSearch, Redo2, Store } from "lucide-react";
import { MenuItem } from "./Menu";

export const menuData: MenuItem[] = [
  {
    id: 1,
    title: "Dashboard",
    icon: <LayoutDashboard />,
    href: "/home",
  },
  {
    id: 11,
    title: "Order",
    icon: <NotepadText  color="red"/>,
    children: [
      { id: 111, title: "All order", icon: <Album />, href: "/order-all-shop"  },
      { id: 112, title: "Order in shop", icon: <Store />, href: "/order-in-shop" },
      { id: 113, title: "Refund", icon: <Redo2 /> },
    ],
  },
  {
    id: 2,
    title: "Products",
    icon: <PackageSearch color="red" />,
    children: [
      { id: 21, title: "New active ", icon: <CircleCheckBig />, href: "/product/active" },
      { id: 22, title: "Product sale", icon: <AlignStartHorizontal /> },
      { id: 23, title: "Product record", icon: <CircleX />, href: "/product/record" },
    ],
  },
  {
    id: 3,
    title: "Settings",
    icon: <NotepadText />,
    href: "/settings",
  },
];
