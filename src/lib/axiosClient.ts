"use client";

import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `${token}`; // gắn token vào header
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Xử lý lỗi response (tuỳ chỉnh)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    if (error.status === 401) {
      window.location.href ="/login"
      console.warn("Token hết hạn hoặc không hợp lệ");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
