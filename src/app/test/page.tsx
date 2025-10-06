"use client";

import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";
import { useState } from "react";

export default function Page() {
  const [count, setCount] = useState(1);

  const loadMore = () => {
    console.log("🌀 Loading more data...");
    setTimeout(() => {
      setCount((prev) => prev + 1);
      console.log(`✅ Loaded page ${count + 1}`);
    }, 1000);
  };

  return (
    <LoadMoreWrapper loadMore={loadMore} hasMore={count < 5} loader={<p>Loading...</p>}>
      <div className="space-y-10">
        {[...Array(count * 5)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-xl"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </LoadMoreWrapper>
  );
}
