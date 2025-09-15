'use client';
import { useState, useEffect } from 'react';
import { Group, groupService } from '@/service/group/group-service';
import { GroupTable } from './GroupTable';
import { GroupManagersModal } from './GroupManagersModal';
import { GroupShopsModal } from './GroupShopsModal';
import { GroupEditModal } from './GroupEditModal';
import LoadingOverlay from '@/components/UI/LoadingOverlay';
import { ShopResponse, UserData } from '@/service/types/ApiResponse';
import { getMyShop } from '@/service/shop/shop-service';
import { ApiResponse } from './../../../service/types/ApiResponse';
import { getMemberInTeam } from '@/service/auth/login-service';

const GroupView = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [managers, setManagers] = useState<UserData[]>([]);
  const [allManagers, setAllManagers] = useState<UserData[]>([]);
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [allShops, setAllShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [showShopsModal, setShowShopsModal] = useState(false);

  useEffect(() => {
    loadGroups();
    loadManagersAndShops();
  }, []);

  const loadManagersAndShops = async () => {
    try {
      const [ member ,shops] = await Promise.all([
        getMemberInTeam(),
        getMyShop()
      ]);
      setAllManagers(member.result || []);
      setAllShops(shops.result || []);
    } catch (error : any) {
      console.error('Error loading managers and shops:', error);
      alert(error.message || 'Failed to load managers and shops');
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAllGroups();
      setGroups(response.result || []);
    } catch (error : any) {
      console.error('Error loading groups:', error);
      alert(error.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroup = async (groupData: { name: string; description: string }) => {
    try {
      setLoading(true);
      if (editingGroup) {
        await groupService.updateGroup({
          id: editingGroup.id,
          groupName: groupData.name,
          description: groupData.description,
          autoGetLabel: editingGroup.autoGetLabel
        });
      } else {
        await groupService.createGroup({
          groupName: groupData.name,
          description: groupData.description
        });
      }
      await loadGroups();
      setShowEditModal(false);
      setEditingGroup(null);
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      setLoading(true);
      await groupService.deleteGroup(groupId);
      await loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async (managerId: string) => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const response =  await groupService.addManagerToGroup(selectedGroup.id, managerId);
      await hanlderOnManageManagers(response.result);
      setGroups(prev =>
        prev.map(g => g.id === selectedGroup.id ? response.result : g)
      );
    } catch (error: any) {
      console.error('Error adding shop:', error);
      alert(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveManager = async (managerId: string) => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response =  await groupService.removeManagerFromGroup(selectedGroup.id, managerId);
      await hanlderOnManageManagers(response.result);
      setGroups(prev =>
        prev.map(g => g.id === selectedGroup.id ? response.result : g)
      );
    } catch (error: any) {
      console.error('Error adding shop:', error);
      alert(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShop = async (shopId: string) => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const response =  await groupService.addShopToGroup(selectedGroup.id, shopId);
      await hanlderOnManageShops(response.result);
      setGroups(prev =>
        prev.map(g => g.id === selectedGroup.id ? response.result : g)
      );
    } catch (error: any) {
      console.error('Error adding shop:', error);
      alert(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShop = async (shopId: string) => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response =  await groupService.removeShopFromGroup(selectedGroup.id, shopId);
      await hanlderOnManageShops(response.result);
      setGroups(prev =>
        prev.map(g => g.id === selectedGroup.id ? response.result : g)
      );
    } catch (error: any) {
      console.error('Error adding shop:', error);
      alert(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };
  const hanlderOnManageManagers = async (group : Group) => {
    try {
      const response = await groupService.getMember(group.id);
      setManagers(response.result || []);
      setSelectedGroup(group);
      setShowManagersModal(true);
    } catch (error : any) {
      console.error('Error loading managers', error);
      alert(error.message || 'Failed to load managers');
    }
  }

   const hanlderOnManageShops = async (group : Group) => {
    try {
      const response = await groupService.getShopMember(group.id);
      setShops(response.result || []);
      setSelectedGroup(group);
      setShowShopsModal(true);
    } catch (error : any) {
      console.error('Error loading managers', error);
      alert(error.message || 'Failed to load managers');
    }
  }

  return (
    <div className="space-y-4">
      {loading && <LoadingOverlay show={loading} />}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingGroup(null);
            setShowEditModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Thêm nhóm mới
        </button>
      </div>

      {showEditModal && (
        <GroupEditModal
          group={editingGroup || undefined}
          onSave={handleSaveGroup}
          onClose={() => {
            setShowEditModal(false);
            setEditingGroup(null);
          }}
        />
      )}

      <GroupTable
        groups={groups}
        onEdit={(group) => {
          setEditingGroup(group);
          setShowEditModal(true);
        }}
        onDelete={handleDeleteGroup}
        onManageManagers={(group) => hanlderOnManageManagers(group)}
        onManageShops={(group) =>hanlderOnManageShops(group)}
      />

      {showManagersModal && selectedGroup && (
        <GroupManagersModal
          group={selectedGroup}
          allManagers={allManagers}
          manager={managers}
          onAddManager={handleAddManager}
          onRemoveManager={handleRemoveManager}
          onClose={() => setShowManagersModal(false)}
        />
      )}

      {showShopsModal && selectedGroup && (
        <GroupShopsModal
          group={selectedGroup}
          allShops={allShops}
          shopMember={shops}
          onAddShop={handleAddShop}
          onRemoveShop={handleRemoveShop}
          onClose={() => setShowShopsModal(false)}
        />
      )}
    </div>
  );
};

export default GroupView;