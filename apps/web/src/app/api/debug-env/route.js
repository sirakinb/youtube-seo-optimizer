export async function GET() {
  return Response.json({
    EXPO_PUBLIC_PROXY_BASE_URL:
      process.env.EXPO_PUBLIC_PROXY_BASE_URL || "undefined",
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || "undefined",
    APP_URL: process.env.APP_URL || "undefined",
    NODE_ENV: process.env.NODE_ENV || "undefined",
  });
}
