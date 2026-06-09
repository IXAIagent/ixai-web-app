import { PositionRequestError } from "@/src/lib/positions/supabase";
import {
  archiveStockPosition,
  getStockPositionById,
  updateStockPosition,
} from "@/src/lib/stock/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StockRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

function notFoundResponse() {
  return Response.json(
    {
      message: "Stock position not found.",
      ok: false,
      status: "not_found",
    },
    { status: 404 },
  );
}

export async function GET(request: Request, context: StockRouteContext) {
  try {
    const { id } = await context.params;
    const position = await getStockPositionById(request.headers.get("authorization"), id);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "ok",
    });
  } catch (error) {
    return stockErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: StockRouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const position = await updateStockPosition(request.headers.get("authorization"), id, body);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "updated",
    });
  } catch (error) {
    return stockErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: StockRouteContext) {
  try {
    const { id } = await context.params;
    const position = await archiveStockPosition(request.headers.get("authorization"), id);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "archived",
    });
  } catch (error) {
    return stockErrorResponse(error);
  }
}
