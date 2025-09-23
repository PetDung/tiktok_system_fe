"use client"
export default function AwaitDesign() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Cài đặt in</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước giấy</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>A4</option>
                            <option>A5</option>
                            <option>Letter</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hướng giấy</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Dọc</option>
                            <option>Ngang</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">In màu</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">In 2 mặt</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Bao gồm header</span>
                    </label>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số bản copy</label>
                    <input type="number" min="1" defaultValue="1" className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
        </div>
    );
}