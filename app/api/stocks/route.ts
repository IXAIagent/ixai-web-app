import {
  PositionRequestError,
} from "@/src/lib/positions/supabase";
import {
  createStockPosition,
  listStockPositions,
} from "@/src/lib/stock/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function stockErrorResponse(error: unknown) {
  if (error instanceof PositionRequestError) {
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
      message: "Stock request failed.",
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
    const positions = await listStockPositions(request.headers.get("authorization"), {
      portfolioId,
    });

    return Response.json({
      ok: true,
      positions,
      status: "ok",
    });
  } catch (error) {
    return stockErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const position = await createStockPosition(request.headers.get("authorization"), body);

    return Response.json(
      {
        ok: true,
        position,
        status: "created",
      },
      { status: 201 },
    );
  } catch (error) {
    return stockErrorResponse(error);
  }
}
