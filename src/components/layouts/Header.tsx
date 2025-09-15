"use client";
import { useAuth } from "@/Context/AuthContext";

type HeaderProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-blue-600 text-white flex items-center px-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mr-3 p-1 bg-blue-500 rounded hover:bg-blue-700"
      >
        {collapsed ? "➡️" : "⬅️"}
      </button>
      <h1 className="font-bold">Hi! {user?.name ?? "Guest"} - {user?.team ?? "Chưa xác định"} </h1>
      {user && (
        <button
          onClick={logout}
          className="ml-auto px-3 py-1 bg-red-500 rounded hover:bg-red-600"
        >
          Logout
        </button>
      )}
    </header>
  );
}
