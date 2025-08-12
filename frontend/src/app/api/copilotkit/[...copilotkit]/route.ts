import { NextRequest, NextResponse } from "next/server";

// Simple mock endpoint for CopilotKit
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Mock response for CopilotKit
    return NextResponse.json({
      success: true,
      message: "CopilotKit endpoint is working",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
