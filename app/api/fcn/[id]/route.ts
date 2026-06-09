import {
  FcnRequestError,
  archiveFCNPosition,
  getFCNPositionById,
  updateFCNPosition,
} from "@/src/lib/fcn/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FcnRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

function notFoundResponse() {
  return Response.json(
    {
      message: "FCN position not found.",
      ok: false,
      status: "not_found",
    },
    { status: 404 },
  );
}

export async function GET(request: Request, context: FcnRouteContext) {
  try {
    const { id } = await context.params;
    const position = await getFCNPositionById(request.headers.get("authorization"), id);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "ok",
    });
  } catch (error) {
    return fcnErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: FcnRouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const position = await updateFCNPosition(request.headers.get("authorization"), id, body);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "updated",
    });
  } catch (error) {
    return fcnErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: FcnRouteContext) {
  try {
    const { id } = await context.params;
    const position = await archiveFCNPosition(request.headers.get("authorization"), id);

    if (!position) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      position,
      status: "archived",
    });
  } catch (error) {
    return fcnErrorResponse(error);
  }
}
