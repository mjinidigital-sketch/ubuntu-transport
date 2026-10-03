import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    const { storageId } = await req.json();

    if (!storageId) {
      return NextResponse.json({ error: "Storage ID is required" }, { status: 400 });
    }

    // Get the URL from Convex storage
    const url = await fetchMutation(api.storage.getStorageUrl, { storageId });

    if (!url) {
      return NextResponse.json({ error: "Failed to get storage URL" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error getting storage URL:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get storage URL" },
      { status: 500 }
    );
  }
}
