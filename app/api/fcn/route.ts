import {
  FcnRequestError,
  createFCNPosition,
  listFCNPositions,
} from "@/src/lib/fcn/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function fcnErrorResponse(error: unknown) {
  if (error instanceof FcnRequestError) {
    return Response.json(
      {
        message: error.message,
        ok: false,
        status: error.code,
      },
      { status: error.status },
    );
  }

  return Response.json(
    {
      message: "FCN request failed.",
      ok: false,
      status: "error",
    },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get("portfolioId") ?? undefined;
    const positions = await listFCNPositions(request.headers.get("authorization"), {
      portfolioId,
    });

    return Response.json({
      ok: true,
      positions,
      status: "ok",
    });
  } catch (error) {
    return fcnErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const position = await createFCNPosition(request.headers.get("authorization"), body);

    return Response.json(
      {
        ok: true,
        position,
        status: "created",
      },
      { status: 201 },
    );
  } catch (error) {
    return fcnErrorResponse(error);
  }
}
