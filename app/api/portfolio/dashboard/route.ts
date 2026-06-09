import { getPortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const summary = await getPortfolioDashboardSummary(request.headers.get("authorization"));

  if (summary.state === "unauthenticated") {
    return Response.json(
      {
        ok: false,
        status: "not_authenticated",
        summary,
      },
      { status: 401 },
    );
  }

  if (summary.state === "error") {
    return Response.json(
      {
        ok: false,
        status: "readback_unavailable",
        summary,
      },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    status: "ok",
    summary,
  });
}
