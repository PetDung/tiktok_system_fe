import axiosClient from '@/lib/axiosClient';
import axios from 'axios';
import {ApiResponse, AuthError, UserData, UserLoginResponse } from '../types/ApiResponse';
import { UserUpdateRequest } from '@/components/pages/Account/PersonalAccount';


export interface UserRequest {
  username : string;
  password:  string;
  name : string;
}

export const loginHandler = async (
  username: string,
  password: string
): Promise<UserLoginResponse> => {
  try {
    const response = await axiosClient.post<UserLoginResponse>(`/login`,{ username, password });
    if (response.data.code === 1000) {
      return response.data;
    }
    throw new AuthError(500, 'Invalid response from server');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError.code || 500,
        serverError.message || 'Login failed. Please try again.'
      );
    }
    throw new AuthError(
      500,
      'An unexpected error occurred. Please try again.'
    );
  }
};

export const getMemberInTeam = async (): Promise<ApiResponse<UserData[]>> => {
  try {
    const response = await axiosClient.get<ApiResponse<UserData[]>>(`/user/member`);
    if (response.data.code === 1000) {
      return response.data;
    }
    throw new AuthError(500, 'Invalid response from server');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError.code || 500,
        serverError.message || 'Login failed. Please try again.'
      );
    }
    throw new AuthError(
      500,
      'An unexpected error occurred. Please try again.'
    );
  }
};

export const createEmployee = async (userRequest : UserRequest): Promise<ApiResponse<UserData>> => {
  try {
    const response = await axiosClient.post<ApiResponse<UserData>>(`/user/create-employee`, userRequest );
    if (response.data.code === 1000) {
      return response.data;
    }
    throw new AuthError(500, 'Invalid response from server');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError.code || 500,
        serverError.message || 'Login failed. Please try again.'
      );
    }
    throw new AuthError(
      500,
      'An unexpected error occurred. Please try again.'
    );
  }
};

export const getMe =  async (): Promise<ApiResponse<UserData>> => {
  try {
    const response = await axiosClient.get<ApiResponse<UserData>>(`/user/me` );
    if (response.data.code === 1000) {
      return response.data;
    }
    throw new AuthError(500, 'Invalid response from server');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError.code || 500,
        serverError.message || 'Login failed. Please try again.'
      );
    }
    throw new AuthError(
      500,
      'An unexpected error occurred. Please try again.'
    );
  }
};
export const updateMe =  async (request : UserUpdateRequest): Promise<ApiResponse<UserData>> => {
  try {
    const response = await axiosClient.put<ApiResponse<UserData>>(`/user/me`, request );
    if (response.data.code === 1000) {
      return response.data;
    }
    throw new AuthError(500, 'Invalid response from server');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError.code || 500,
        serverError.message || 'Login failed. Please try again.'
      );
    }
    throw new AuthError(
      500,
      'An unexpected error occurred. Please try again.'
    );
  }
};


