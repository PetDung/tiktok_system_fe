import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReturnCard from './ReturnCard';
import { RefundResponse } from '@/service/types/ApiResponse';

interface ReturnsDashboardProps {
    data: RefundResponse;
    loading: boolean;
    search: (page: number, key: string, append?: boolean) => Promise<void>
    keywordParam: string;
}

const ReturnsDashboard: React.FC<ReturnsDashboardProps> = ({ data, search, loading, keywordParam }) => {


    const [keyword, setKeyword] = useState<string>(keywordParam);
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const observerRef = useRef<HTMLDivElement | null>(null);

    const filteredAndSortedOrders = useMemo(() => {

        let filtered = data.orders || [];
        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return b.updateTime - a.updateTime;
            } else {
                return (b?.refundAmount?.refundTotal || 0) - (a?.refundAmount?.refundTotal || 0);
            }
        });

        return filtered;
    }, [data.orders, sortBy]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !loading && !isFetchingMore && !data.last) {
                    const nextPage = (data.current_page || 0) + 1;
                    setIsFetchingMore(true);

                    search(nextPage, keyword, true)
                        .finally(() => {
                            setIsFetchingMore(false);
                        });
                }
            },
            { threshold: 1.0 }
        );

        const node = observerRef.current;
        if (node) observer.observe(node);

        return () => {
            if (node) observer.unobserve(node);
            observer.disconnect();
        };
    }, [data.current_page, data.last, loading, keyword, search, isFetchingMore]);

    return (
        <div className="p-4 mx-auto bg-gray-100">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
                <p className="text-gray-600">
                    Manage and track all return requests and refunds
                </p>
            </div>
            {/* Status */}
            <div className="flex flex-wrap gap-4 pb-8 sticky top-0 bg-gray-100 z-30">
                {/* Total Returns */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Total Returns</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.total_count}</p>
                </div>

                {/* Sort By */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="date">Date</option>
                        <option value="amount">Refund Amount</option>
                    </select>
                </div>

                {/* Search */}
                <div className="bg-white flex-1 p-6 rounded-lg border border-gray-200">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            search(0, keyword);
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Search by Order ID or Return ID"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>



            {/* Orders Grid */}
            <div className="flex flex-col gap-2">
                {filteredAndSortedOrders.map((order) => (
                    <ReturnCard key={order.returnId} order={order} />
                ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedOrders.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
                    <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                </div>
            )}

            <div ref={observerRef} className="h-10"></div>
        </div>
    );
};

export default ReturnsDashboard;