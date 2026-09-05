// All live conversations use /api/discovery and its server-owned session.
export async function POST() {
  return Response.json(
    {
      error:
        "This endpoint has been retired. Reload the site to use session-scoped discovery.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
