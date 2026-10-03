import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  try {
    // Get upload URL from Convex
    const uploadUrl = await fetchMutation(api.storage.generateUploadUrl);

    if (!uploadUrl) {
      return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
