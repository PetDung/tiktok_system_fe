'use client';

import PersonalAccount from "@/components/pages/Account/PersonalAccount";
import UserManagement from "@/components/pages/Account/UserManagement";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/Tabs";

export default function AccountPage() {
  return (
    <div className="min-h-[90vh] bg-gray-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
        <p className="text-sm text-gray-600">Quản lý thông tin cá nhân và người dùng hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="border-b">
            <TabsTrigger value="personal">Tài khoản của tôi</TabsTrigger>
            <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="p-6">
            <PersonalAccount />
          </TabsContent>
          <TabsContent value="users" className="p-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}