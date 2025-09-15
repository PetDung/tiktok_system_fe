'use client';
import GroupView from "@/components/pages/Group/GroupView";

export default function GroupManagementPage() {
  return (
    <div className="min-h-[90vh] bg-gray-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Group Management</h1>
        <p className="text-sm text-gray-600">Manage your groups, shops, and managers</p>
      </div>
      <GroupView />
    </div>
  );
}