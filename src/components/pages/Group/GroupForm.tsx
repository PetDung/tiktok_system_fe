'use client';
import { useState } from 'react';
import { CreateGroupDto, UpdateGroupDto } from '@/service/group/group-service';

interface GroupFormProps {
  initialData?: UpdateGroupDto;
  onSubmit: (data: CreateGroupDto | UpdateGroupDto) => Promise<void>;
  onCancel: () => void;
}

export const GroupForm = ({ initialData, onSubmit, onCancel }: GroupFormProps) => {
  const [formData, setFormData] = useState<Omit<CreateGroupDto, 'employeeIds' | 'shopIds'>>({
    groupName: initialData?.groupName || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = initialData 
      ? { 
          id: initialData.id,
          groupName: formData.groupName,
          description: formData.description,
        } as UpdateGroupDto
      : { 
          ...formData,
          employeeIds: [],
          shopIds: []
        } as CreateGroupDto;
    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            type="text"
            id="groupName"
            value={formData.groupName}
            onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {initialData ? 'Update Group' : 'Create Group'}
          </button>
        </div>
      </div>
    </form>
  );
};