"use client";

import { UserUpdateRequest } from "@/components/pages/Account/PersonalAccount";
import { getMe, updateMe } from "@/service/auth/login-service";
import { UserData } from "@/service/types/ApiResponse";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: UserData | null;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  updateMe: (updateRequest: UserUpdateRequest) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token từ localStorage khi refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setTokenState(storedToken);

    (async () => {
      try {
        const response = await getMe();
        setUser(response.result);
      } catch (error) {
        console.error("Failed to load user:", error);
        logout(); // Token hết hạn → logout
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
      document.cookie = `token=${newToken}; path=/;`;
    } else {
      localStorage.removeItem("token");
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  };

  const updateMeHandler = async (updateRequest: UserUpdateRequest) => {
    try {
      const response = await updateMe(updateRequest);
      setUser(response.result);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error; // cho phép FE xử lý (hiện toast/alert)
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        logout,
        loading,
        updateMe: updateMeHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện lợi để dùng context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
