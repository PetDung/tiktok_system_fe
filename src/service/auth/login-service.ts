import axiosClient from '@/lib/axiosClient';
import axios from 'axios';
import {ApiResponse, UserLoginResponse } from '../types/ApiResponse';


export class AuthError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
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

