"use client";

import { useAuth } from "@/Context/AuthContext";
import React, { useState, useEffect } from "react";

// Kiểu dữ liệu form
export interface UserUpdateRequest {
  name: string;
  username: string; // read-only, disabled
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Kiểu lỗi
interface FormErrors {
  name: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Hàm validate tách riêng
const validateForm = (formData: UserUpdateRequest): FormErrors => {
  const errors: FormErrors = {
    name: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // validate name
  if (!formData.name.trim()) {
    errors.name = "Tên hiển thị không được để trống";
  }

  // validate mật khẩu (chỉ khi nhập newPassword)
  if (formData.newPassword) {
    if (!formData.oldPassword) {
      errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (formData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    } else if (!/[a-zA-Z]/.test(formData.newPassword) || !/\d/.test(formData.newPassword)) {
      errors.newPassword = "Mật khẩu mới phải chứa cả chữ và số";
    }

    if (formData.confirmPassword !== formData.newPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
  }

  return errors;
};

export default function ProfileForm() {

  const { user, updateMe } = useAuth();

  const [formData, setFormData] = useState<UserUpdateRequest>({
    name: "",
    username: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Đồng bộ form với user khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name ?? "",
        username: user.username ?? "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // username là disabled nên không cần set nhưng giữ generic handler
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.values(validationErrors).some((err) => err !== "")) {
      return;
    }

    try {
      setIsLoading(true);
      await updateMe(formData);
    } catch (error) {
      alert(error)
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {/* Username (disabled/read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          disabled
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>

      {/* Tên hiển thị */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Mật khẩu hiện tại */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
        <input
          type="password"
          name="oldPassword"
          autoComplete="new-password"
          value={formData.oldPassword}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {errors.oldPassword && <p className="text-sm text-red-600 mt-1">{errors.oldPassword}</p>}
      </div>

      {/* Mật khẩu mới */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
      </div>

      {/* Xác nhận mật khẩu */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
