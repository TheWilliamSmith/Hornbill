import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL;

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  if (!API_URL) {
    return NextResponse.json(
      { error: "API_URL environment variable is not defined" },
      { status: 500 },
    );
  }

  const { path } = await params;
  const { search } = new URL(req.url);
  const targetUrl = `${API_URL}/${path.join("/")}${search}`;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const authHeader = req.headers.get("Authorization");
  if (authHeader) headers.set("Authorization", authHeader);

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
  });

  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody.byteLength > 0 ? responseBody : null, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
