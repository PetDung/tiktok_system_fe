"use client"

export default function Printing() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Xem trước đơn hàng</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-sm text-gray-600 mb-2">Preview đơn hàng</div>
                    <div className="border-b pb-2 mb-2">
                        <h4 className="font-semibold">CÔNG TY ABC</h4>
                        <p className="text-xs text-gray-600">Địa chỉ: 123 Đường XYZ, Quận 1, TP.HCM</p>
                    </div>
                    <div className="text-left space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Mã đơn: #12345</span>
                            <span>01/01/2024</span>
                        </div>
                        <div>Khách hàng: Nguyễn Văn A</div>
                        <div className="border-t pt-2 mt-2">
                            <div>Sản phẩm: Laptop Dell</div>
                            <div>Số lượng: 1</div>
                            <div>Giá: 15,000,000 VNĐ</div>
                        </div>
                    </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    🖨️ In đơn hàng
                </button>
            </div>
        </div>
    );
}