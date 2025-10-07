import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { getAllDesigns, getDesignsCursor, mappingDesign, ParamMapping } from "@/service/design/design-service";
import { Design, LineItem } from "@/service/types/ApiResponse";
import { X, Image, Package, Search, Grid, List, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LineItemHasQuantity } from "./OrderItemModalView";
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { debounce } from "lodash";
import LoadingOverlay from "@/components/UI/LoadingOverlay";

type ModalProps = {
    onClose: () => void;
    item: LineItemHasQuantity;
};

type FetchDesignParams = {
    cursor?: string | null;
    append?: boolean;
    search?: string | null;
};

export default function ModalDesignAdd({ onClose, item }: ModalProps) {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(item.lineItemFist.design || null);
    const [loading, setLoading] = useState(false);

    const [pageToken, setPageToken] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [total, setTotal] = useState<number>(0);


    const fetchDesignCursor = async (params: FetchDesignParams) => {
        const {
            cursor = "",
            append = false,
            search = null,
        } = params;

        const response = await getDesignsCursor({
            cursor, search
        });
        const list = response?.result?.data ?? [];
        setDesigns(prev => append ? [...prev, ...list] : list);
        setHasMore(response?.result?.hasMore ?? false);
        setPageToken(response?.result?.nextCursor ?? "");
        setTotal(response?.result?.total ?? 0);
    };

    
    const loadMore = async () =>{
        if (!hasMore) return;
        const param : FetchDesignParams = {
            cursor : pageToken,
            append : true,
        }
        await fetchDesignCursor(param);
    }

    const debouncedSearch = useCallback(
        debounce(async (value: string) => {
            await fetchDesignCursor({ search: value || null });
        }, 500),
        [fetchDesignCursor]
    );

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleDesignSelect = (design: Design) => {
        setSelectedDesign(design);
        // Thêm logic để apply design vào item ở đây
    };

    const handleSubmit = async () => {
        if (!item?.lineItemFist.product_id?.trim()) {
            alert("Vui lòng nhập Product ID");
            return;
        }
        if (!item?.lineItemFist.sku_id) {
            alert("Vui lòng chọn ít nhất 1 SKU");
            return;
        }
        if (!selectedDesign) {
            alert("Vui lòng chọn Design");
            return;
        }

        const payload: ParamMapping = {
            productId: item.lineItemFist.product_id,
            skuIds: [item.lineItemFist.sku_id],
            designId: selectedDesign.id,
        };

        setLoading(true);
        try {
            const response = await mappingDesign(payload);
            console.log(response);;
            setSelectedDesign(null);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra: " + error);
        } finally {
            setLoading(false);
        }
    };

    const getDesignImages = (design: Design) => {
        const images = [];
        if (design.frontSide) images.push({ type: 'Front', url: design.frontSide });
        if (design.backSide) images.push({ type: 'Back', url: design.backSide });
        if (design.leftSide) images.push({ type: 'Left', url: design.leftSide });
        if (design.rightSide) images.push({ type: 'Right', url: design.rightSide });
        return images;
    };
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-4 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Chọn Design</h2>
                                    {item && (
                                        <p className="text-sm text-gray-600">cho sản phẩm: {item.productName}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search and View Controls */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm design..."
                                    value={searchTerm}
                                    onChange={handleKeywordChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        <LoadMoreWrapper loadMore={loadMore} hasMore={hasMore} loader={(<LoadingIndicator />)} rootMargin="300px">
                            <div className="space-y-4">
                                {designs.map((design) => (
                                    <div
                                        key={design.id}
                                        className={`group bg-white rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${selectedDesign?.id === design.id
                                            ? 'border-purple-500 shadow-lg'
                                            : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                        onClick={() => handleDesignSelect(design)}
                                    >
                                        <div className="flex gap-6">
                                            {/* Thumbnail */}
                                            <ThumbPreview
                                                thumbUrl={design.thumbnail || ""}
                                                size={100}
                                            />

                                            {/* Design Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{design.name}</h3>
                                                <p className="text-sm text-gray-500 mb-3">ID: {design.id}</p>

                                                {/* Design Images */}
                                                <div className="flex flex-wrap gap-2">
                                                    {getDesignImages(design).map((img, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            {img.type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </LoadMoreWrapper>
                    </div>

                    {/* Footer */}
                    {selectedDesign && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Đã chọn:</p>
                                    <p className="font-semibold text-gray-900">{selectedDesign.name}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                                    >
                                        Áp dụng Design
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <LoadingOverlay show={loading} />
            </div>
        </>
    );
}