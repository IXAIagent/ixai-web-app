import {
  generateScheduledDailyDraft,
  getExpectedCronSecret,
  isSchedulerConfigured,
} from "@/src/lib/editorial/scheduler";

export const dynamic = "force-dynamic";

function tokenFromRequest(request: Request) {
  const url = new URL(request.url);
  const authorization = request.headers.get("authorization") ?? "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  const headerToken =
    request.headers.get("x-ixai-cron-secret") ??
    request.headers.get("x-cron-secret") ??
    bearerToken;

  return headerToken || url.searchParams.get("token") || "";
}

function unauthorized() {
  return Response.json(
    {
      status: "unauthorized",
      message: "Missing or invalid scheduler token.",
    },
    { status: 401 },
  );
}

async function handleGenerate(request: Request, method: "POST" | "GET") {
  const expectedToken = getExpectedCronSecret();

  if (!isSchedulerConfigured() || !expectedToken) {
    return Response.json(
      {
        status: "scheduler_not_configured",
        message: "IXAI_CRON_SECRET is not configured. Set it before enabling scheduled draft generation.",
      },
      { status: 503 },
    );
  }

  if (tokenFromRequest(request) !== expectedToken) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const summary = await generateScheduledDailyDraft({ force });

  return Response.json({
    ...summary,
    method,
  });
}

export async function POST(request: Request) {
  return handleGenerate(request, "POST");
}

export async function GET(request: Request) {
  return handleGenerate(request, "GET");
}
