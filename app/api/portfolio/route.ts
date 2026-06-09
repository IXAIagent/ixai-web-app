import {
  PortfolioRequestError,
  createPortfolio,
  listPortfolios,
} from "@/src/lib/portfolio/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeArchived =
      url.searchParams.get("includeArchived") === "1" ||
      url.searchParams.get("includeArchived") === "true";
    const portfolios = await listPortfolios(request.headers.get("authorization"), {
      includeArchived,
    });

    return Response.json({
      ok: true,
      portfolios,
      status: "ok",
    });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const portfolio = await createPortfolio(request.headers.get("authorization"), body);

    return Response.json(
      {
        ok: true,
        portfolio,
        status: "created",
      },
      { status: 201 },
    );
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}
