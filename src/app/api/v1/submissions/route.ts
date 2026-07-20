import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sprintId, githubRepoUrl, deploymentUrl, notes } = body;

    if (!githubRepoUrl || !deploymentUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Both GitHub Repository URL and Deployment URL are required.",
        },
        { status: 400 }
      );
    }

    const submission = {
      id: `sub_${Date.now()}`,
      sprintId,
      userId: "usr_alex_01",
      githubRepoUrl,
      deploymentUrl,
      notes: notes || "",
      submittedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Submission received and queued for AI Judge evaluation",
      data: submission,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload" },
      { status: 400 }
    );
  }
}
