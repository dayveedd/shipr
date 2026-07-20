import { NextResponse } from "next/server";
import { MOCK_SPRINTS } from "@/services/mockData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sprint = MOCK_SPRINTS.find((s) => s.slug === slug) || MOCK_SPRINTS[0];

  return NextResponse.json({
    success: true,
    message: "Sprint detail retrieved",
    data: sprint,
  });
}
