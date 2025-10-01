"use client"

import { useState } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Package,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Percent,
  RefreshCw
} from 'lucide-react';

export default function DashboardStatistics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock data - thay bằng API thực tế
  const currentMonthStats = {
    totalOrders: 1247,
    totalRevenue: 125750000,
    completedOrders: 1089,
    pendingOrders: 158,
    averageOrderValue: 100840,
    topProducts: 45,
    newCustomers: 234,
    returningRate: 68
  };

  const lastMonthStats = {
    totalOrders: 1156,
    totalRevenue: 115200000
  };

  const calculateGrowth = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth > 0
    };
  };

  const orderGrowth = calculateGrowth(currentMonthStats.totalOrders, lastMonthStats.totalOrders);
  const revenueGrowth = calculateGrowth(currentMonthStats.totalRevenue, lastMonthStats.totalRevenue);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="bg-white shadow-lg h-[calc(100vh-56px)] flex flex-col">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white">
        <div className="mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            
            {/* Month/Year Selector */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <Calendar className="w-5 h-5 text-white" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="outline-none text-sm font-medium text-white cursor-pointer bg-transparent"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index} className="text-gray-900">{month}</option>
                ))}
              </select>
              <span className="text-white/40">|</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="outline-none text-sm font-medium text-white cursor-pointer bg-transparent"
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year} className="text-gray-900">{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full px-8 pt-4 pb-12 flex-1 min-h-0 overflow-auto custom-scroll">
        {/* Main Revenue & Orders Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold ${
                  revenueGrowth.isPositive ? 'bg-white/20' : 'bg-red-500/30'
                }`}>
                  {revenueGrowth.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {revenueGrowth.value}%
                </div>
              </div>
              <h3 className="text-green-100 text-sm font-medium mb-2">Tổng Doanh Thu</h3>
              <p className="text-4xl font-bold mb-3">{formatCurrency(currentMonthStats.totalRevenue)}</p>
              <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-green-100 text-xs mb-1">Tháng trước</p>
                  <p className="text-lg font-semibold">{formatCurrency(lastMonthStats.totalRevenue)}</p>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div>
                  <p className="text-green-100 text-xs mb-1">TB/Đơn</p>
                  <p className="text-lg font-semibold">{formatCurrency(currentMonthStats.averageOrderValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold ${
                  orderGrowth.isPositive ? 'bg-white/20' : 'bg-red-500/30'
                }`}>
                  {orderGrowth.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {orderGrowth.value}%
                </div>
              </div>
              <h3 className="text-blue-100 text-sm font-medium mb-2">Tổng Đơn Hàng</h3>
              <p className="text-4xl font-bold mb-3">{formatNumber(currentMonthStats.totalOrders)}</p>
              <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-blue-100 text-xs mb-1">Hoàn thành</p>
                  <p className="text-lg font-semibold">{formatNumber(currentMonthStats.completedOrders)}</p>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div>
                  <p className="text-blue-100 text-xs mb-1">Đang xử lý</p>
                  <p className="text-lg font-semibold">{formatNumber(currentMonthStats.pendingOrders)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Khách hàng mới</p>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(currentMonthStats.newCustomers)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Sản phẩm HOT</p>
            <p className="text-3xl font-bold text-gray-900">{currentMonthStats.topProducts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Percent className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Tỷ lệ hoàn thành</p>
            <p className="text-3xl font-bold text-gray-900">
              {((currentMonthStats.completedOrders / currentMonthStats.totalOrders) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Khách quay lại</p>
            <p className="text-3xl font-bold text-gray-900">{currentMonthStats.returningRate}%</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Trạng Thái Đơn Hàng</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Hoàn thành</span>
                  <span className="text-sm font-bold text-gray-900">{formatNumber(currentMonthStats.completedOrders)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${(currentMonthStats.completedOrders / currentMonthStats.totalOrders) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Đang xử lý</span>
                  <span className="text-sm font-bold text-gray-900">{formatNumber(currentMonthStats.pendingOrders)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${(currentMonthStats.pendingOrders / currentMonthStats.totalOrders) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-gray-900">{formatNumber(currentMonthStats.totalOrders)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Comparison */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">So Sánh Doanh Thu</h2>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tháng này</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(currentMonthStats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tháng trước</p>
                  <p className="text-xl font-bold text-gray-700">{formatCurrency(lastMonthStats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Chênh lệch</span>
                  <span className={`text-2xl font-bold flex items-center gap-2 ${
                    revenueGrowth.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenueGrowth.isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    {formatCurrency(Math.abs(currentMonthStats.totalRevenue - lastMonthStats.totalRevenue))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}