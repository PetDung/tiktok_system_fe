"use client"
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { connectShop } from '@/service/shop/shop-service';

export default function ConnectShopComponets() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    code: searchParams.get('code') || '',
    userName: '',
    userShopName: ''
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setFormData(prev => ({
        ...prev,
        code: code
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await connectShop({
        code: formData.code,
        userName: formData.userName,
        userShopName: formData.userShopName
      });
      // Xử lý khi thành công
      alert("Connected successfully");
      console.log('Connected successfully:', response);
      // Có thể thêm thông báo thành công hoặc chuyển hướng người dùng
    } catch (error) {
      // Xử lý khi có lỗi
      alert(error)
      console.error('Connection failed:', error);
      // Có thể hiển thị thông báo lỗi cho người dùng
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Connect Shop</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <input
              id="code"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              required
              disabled
            />
          </div>

          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              User Name
            </label>
            <input
              id="userName"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="userShopName" className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              id="userShopName"
              type="text"
              name="userShopName"
              value={formData.userShopName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}