import { PositionRequestError } from "@/src/lib/positions/supabase";
import {
  createCryptoPosition,
  listCryptoPositions,
} from "@/src/lib/crypto/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get("portfolioId") ?? undefined;
    const positions = await listCryptoPositions(request.headers.get("authorization"), {
      portfolioId,
    });

    return Response.json({
      ok: true,
      positions,
      status: "ok",
    });
  } catch (error) {
    return cryptoErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const position = await createCryptoPosition(request.headers.get("authorization"), body);

    return Response.json(
      {
        ok: true,
        position,
        status: "created",
      },
      { status: 201 },
    );
  } catch (error) {
    return cryptoErrorResponse(error);
  }
}
