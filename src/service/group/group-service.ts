import axios from 'axios';
import { ApiResponse, AuthError, ShopResponse, UserData } from '../types/ApiResponse';
import axiosClient from '@/lib/axiosClient';

export interface Group {
  id: string;
  groupName: string;
  description?: string;
  autoGetLabel: boolean;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  memberCount: number;
  shopCount: number;

}

export interface CreateGroupDto {
  groupName: string;
  description?: string;
}

export interface UpdateGroupDto {
  id: string;
  groupName: string;
  description?: string;
  autoGetLabel?: boolean;
}

class GroupService {
  private baseUrl = '/group';

  async getAllGroups(): Promise<ApiResponse<Group[]>> {
    try {
      const response = await axiosClient.get<ApiResponse<Group[]>>(this.baseUrl);
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }

  async getGroupById(id: string): Promise<Group | null> {
    const response = await axiosClient.get<ApiResponse<Group>>(`${this.baseUrl}/${id}`);
    return response.data.data || null;
  }

  async createGroup(data: CreateGroupDto): Promise<ApiResponse<Group>> {
    try {
      const response = await axiosClient.post<ApiResponse<Group>>(this.baseUrl, data);
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }

  async updateGroup(data: UpdateGroupDto): Promise<Group> {
    const response = await axiosClient.put<ApiResponse<Group>>(`${this.baseUrl}/${data.id}`, data);
    return response.data.data;
  }

  async deleteGroup(id: string): Promise<void> {
    await axiosClient.delete(`${this.baseUrl}/${id}`);
  }

  async addManagerToGroup(groupId: string, accountId: string): Promise<ApiResponse<Group>> {
     try {
      const response  = await axiosClient
          .put<ApiResponse<Group>>(`${this.baseUrl}/update/member/${groupId}/${accountId}`, {}, {
            params:{
              action : "ADD"
            }
          });
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }

  
  async removeManagerFromGroup(groupId: string, accountId: string): Promise<ApiResponse<Group>> {
     try {
      const response  = await axiosClient
          .put<ApiResponse<Group>>(`${this.baseUrl}/update/member/${groupId}/${accountId}`, {}, {
            params:{
              action : "REMOVE"
            }
          });
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }

  async addShopToGroup(groupId: string, shopId: string): Promise<ApiResponse<Group>> {
    try {
      const response  = await axiosClient
          .put<ApiResponse<Group>>(`${this.baseUrl}/update/shop-member/${groupId}/${shopId}`, {}, {
            params:{
              action : "ADD"
            }
          });
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
    
  }

  async removeShopFromGroup(groupId: string, shopId: string):  Promise<ApiResponse<Group>> {
    try {
      const response  = await axiosClient
          .put<ApiResponse<Group>>(`${this.baseUrl}/update/shop-member/${groupId}/${shopId}`, {}, {
            params:{
              action : "REMOVE"
            }
          });
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }

  async getMember(groupId: string): Promise<ApiResponse<UserData[]>> {
     try {
      const response  = await axiosClient.get<ApiResponse<UserData[]>>(`${this.baseUrl}/member/${groupId}`);
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }
   async getShopMember(groupId: string): Promise<ApiResponse<ShopResponse[]>> {
     try {
      const response  = await axiosClient.get<ApiResponse<ShopResponse[]>>(`${this.baseUrl}/shop-member/${groupId}`);
      if (response.data.code === 1000) {
        return response.data;
      }
      throw new AuthError(500, "Invalid response from server");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as ApiResponse<any>;
        throw new AuthError(
          serverError.code || 500,
          serverError.message || "Please try again."
        );
      }
      throw new AuthError(500, "An unexpected error occurred. Please try again.");
    }
  }
}

export const groupService = new GroupService();