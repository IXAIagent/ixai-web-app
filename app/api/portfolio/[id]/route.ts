import {
  PortfolioRequestError,
  archivePortfolio,
  getPortfolioById,
  updatePortfolio,
} from "@/src/lib/portfolio/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PortfolioRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function portfolioErrorResponse(error: unknown) {
  if (error instanceof PortfolioRequestError) {
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
      message: "Portfolio request failed.",
      ok: false,
      status: "error",
    },
    { status: 500 },
  );
}

function notFoundResponse() {
  return Response.json(
    {
      message: "Portfolio not found.",
      ok: false,
      status: "not_found",
    },
    { status: 404 },
  );
}

export async function GET(request: Request, context: PortfolioRouteContext) {
  try {
    const { id } = await context.params;
    const portfolio = await getPortfolioById(request.headers.get("authorization"), id);

    if (!portfolio) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      portfolio,
      status: "ok",
    });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: PortfolioRouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const portfolio = await updatePortfolio(request.headers.get("authorization"), id, body);

    if (!portfolio) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      portfolio,
      status: "updated",
    });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: PortfolioRouteContext) {
  try {
    const { id } = await context.params;
    const portfolio = await archivePortfolio(request.headers.get("authorization"), id);

    if (!portfolio) {
      return notFoundResponse();
    }

    return Response.json({
      ok: true,
      portfolio,
      status: "archived",
    });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}
