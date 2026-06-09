import { PositionRequestError } from "@/src/lib/positions/supabase";
import {
  archiveCryptoPosition,
  getCryptoPositionById,
  updateCryptoPosition,
} from "@/src/lib/crypto/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CryptoRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function cryptoErrorResponse(error: unknown) {
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
      message: "Crypto request failed.",
      ok: false,
      status: "error",
    },
    { status: 500 },
  );
}

function notFoundResponse() {
  return Response.json(
    {
      message: "Crypto position not found.",
      ok: false,
      status: "not_found",
    },
    { status: 404 },
  );
}

export async function GET(request: Request, context: CryptoRouteContext) {
  try {
    const { id } = await context.params;
    const position = await getCryptoPositionById(request.headers.get("authorization"), id);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "ok",
    });
  } catch (error) {
    return cryptoErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: CryptoRouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const position = await updateCryptoPosition(request.headers.get("authorization"), id, body);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "updated",
    });
  } catch (error) {
    return cryptoErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: CryptoRouteContext) {
  try {
    const { id } = await context.params;
    const position = await archiveCryptoPosition(request.headers.get("authorization"), id);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "archived",
    });
  } catch (error) {
    return cryptoErrorResponse(error);
  }
}
