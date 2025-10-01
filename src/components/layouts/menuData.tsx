import { Album, AlignStartHorizontal, BookAlert, CircleCheckBig, CircleGauge, CircleX, Component, Group, Info, LayoutDashboard, NotepadText, PackageSearch, Printer, Redo2, Settings, Stamp, Store, UserCog } from "lucide-react";
import { MenuItem } from "./Menu";

export const menuData: MenuItem[] = [
  {
    id: 1,
    title: "Dashboard",
    icon: <LayoutDashboard />,
    children: [
      { id: 111, title: "Hướng đẫn", icon: <BookAlert />, href: "/home"  },
      { id: 112, title: "Thống kê", icon: <CircleGauge /> , href: "/home/dashboard" },
      // { id: 113, title: "Refund", icon: <Redo2 /> },
    ],
  },
  {
    id: 11,
    title: "Order",
    icon: <NotepadText  color="red"/>,
    children: [
      { id: 111, title: "All order", icon: <Album />, href: "/order-all-shop"  },
      { id: 112, title: "Order in shop", icon: <Store />, href: "/order-in-shop" },
      { id: 113, title: "Refund", icon: <Redo2 />, href: "/refund" },
      { id: 114223233, title: "Print Order", icon: <Stamp />, href: "/print-order" },
    ],
  },
  {
    id: 2,
    title: "Products",
    icon: <PackageSearch color="red" />,
    children: [
      { id: 21, title: "New active ", icon: <CircleCheckBig />, href: "/product/active" },
      { id: 22, title: "Product sale", icon: <AlignStartHorizontal />,  href: "/product/sale"  },
      { id: 23, title: "Product record", icon: <CircleX />, href: "/product/record" },
    ],
  },
  {
    id: 4,
    title: "Design",
    icon: <Component color="red" />,
     children: [
      { id: 60, title: "Add", icon: <CircleCheckBig />, href: "/design/add" },
      { id: 378921789312, title: "Nhà in", icon: <Printer />, href: "/design/printer" },
    ],
  },
  {
    id: 3,
    title: "Settings",
    icon: <Settings color="red" />,
    children: [
      { id: 22133, title: "Shop setting", icon: <Store />, href: "/setting/shop" },
      { id: 321123, title: "Account setting", icon: <UserCog />,  href: "/setting/account"  },
      { id: 2323123, title: "Infomation", icon: <Info />, href: "/setting/info" },
      { id: 378921789312, title: "Nhóm", icon: <Group />, href: "/setting/group" },
    ],
  },
];
