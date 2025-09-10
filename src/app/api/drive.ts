// pages/api/drive-thumb.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query;
  if (!fileId || typeof fileId !== "string") {
    return res.status(400).json({ error: "Missing fileId" });
  }

  const API_KEY = process.env.NEXT_PUBLIC_API_GG_KEY;

  try {
    // 1. Lấy metadata để lấy thumbnailLink
    const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink&key=${API_KEY}`;
    const metadataRes = await fetch(metadataUrl);
    if (!metadataRes.ok) return res.status(metadataRes.status).json({ error: "Failed to fetch metadata" });

    const data = await metadataRes.json();
    if (!data.thumbnailLink) return res.status(404).json({ error: "Thumbnail not available" });

    // 2. Fetch thumbnailLink thực sự (ảnh nhỏ)
    const thumbRes = await fetch(data.thumbnailLink);
    if (!thumbRes.ok) return res.status(thumbRes.status).json({ error: "Failed to fetch thumbnail" });

    const contentType = thumbRes.headers.get("content-type") || "image/jpeg";
    const buffer = await thumbRes.arrayBuffer();

    // 3. Trả thẳng binary image cho client
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1h
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
