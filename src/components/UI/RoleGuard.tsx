import { useAuth } from "@/Context/AuthContext";
import { ReactNode } from "react";

interface RoleGuardProps {
  role: string | string[];   // Cho phép truyền 1 role hoặc nhiều role
  children: ReactNode;
}

export default function RoleGuard({ role, children }: RoleGuardProps) {
  const { user } = useAuth();

  // Cho phép role là mảng hoặc string
  const allowed = Array.isArray(role) 
    ? role.includes(user?.role || "") 
    : role === user?.role ;

  if (!allowed) return null; // Không có quyền thì không render gì

  return <>{children}</>;
}
