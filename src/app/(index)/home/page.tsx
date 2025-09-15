"use client";
import { menuData } from "@/components/layouts/menuData";
import { ReactNode } from "react";

function getDescription(href?: string): string {
  switch (href) {
    case "/home":
      return "Xem hướng dẫn sử dụng hệ thống chi tiết.";
    case "/order-all-shop":
      return "Quản lý tất cả đơn hàng từ nhiều shop khác nhau.";
    case "/order-in-shop":
      return "Xem đơn hàng theo từng shop riêng lẻ.";
    case "/product/active":
      return "Danh sách sản phẩm trong shop được active từ sau khi add shop vào hệ thống.";
    case "/product/sale":
      return "Xem thống kê các sản phẩm đang bán chạy từ các đơn hàng";
    case "/product/record":
      return "Xem sản phẩm bị lỗi và lý do từ sau khi add shop vào hệ thống.";
    case "/setting/shop":
      return "Xem danh sách và sử tên shop đã add vào hệ thống.";
    case "/setting/info":
      return "Lấy link cần thiết";
    case "/design/add":
      return "Thêm des hoặc ảnh cần export ra excel cùng đơn.";
    case "/design/list":
      return "Quản lý desgin";
    default:
      return "Trang chức năng đang phát triển hoặc chưa có mô tả.";
  }
}

export default function GuidePage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Hướng dẫn sử dụng hệ thống</h1>
       <div
          className="bg-white shadow-md rounded-2xl p-4 border border-gray-100"
        >
          {/* Header */}
          <div className="flex flex-row items-center gap-2 border-b pb-2 mb-3">
            <h2 className="font-semibold text-lg">Đang phát triển và update</h2>
          </div>

          {/* Content */}
          <div className="space-y-4">
              <div className="pl-4">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <span>Add track cho đơn ship by seller</span>
                </div>
                <p className="pl-8 text-gray-600 text-sm">
                  Chức năng này đang phát triển, dự kiến sẽ hoàn thành trong tháng 9/2024.
                </p>
                {/* Separator */}
                <div className="border-t border-gray-200 my-2" />
              </div>
             <div className="pl-4">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <span>Phân chia shop cho từng nhân viên</span>
                </div>
                <p className="pl-8 text-gray-600 text-sm">
                  Chức năng này đang phát triển, dự kiến sẽ hoàn thành trong tháng 9/2024.
                </p>
                {/* Separator */}
                <div className="border-t border-gray-200 my-2" />
              </div>
              <div className="pl-4">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <span>Thống kê doanh thu và xem tiền về</span>
                </div>
                <p className="pl-8 text-gray-600 text-sm">
                  Chức năng này đang phát triển, dự kiến sẽ hoàn thành trong tháng 9/2024.
                </p>
                {/* Separator */}
                <div className="border-t border-gray-200 my-2" />
              </div>
          </div>
        </div>

      {menuData.map((section) => (
        <div
          key={section.id}
          className="bg-white shadow-md rounded-2xl p-4 border border-gray-100"
        >
          {/* Header */}
          <div className="flex flex-row items-center gap-2 border-b pb-2 mb-3">
            <div className="text-xl">{section.icon as ReactNode}</div>
            <h2 className="font-semibold text-lg">{section.title}</h2>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {section.children?.map((child) => (
              <div key={child.id} className="pl-4">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  {child.icon as ReactNode}
                  <span>{child.title}</span>
                </div>
                <p className="pl-8 text-gray-600 text-sm">
                  {getDescription(child.href)}
                </p>

                {/* Separator */}
                <div className="border-t border-gray-200 my-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
