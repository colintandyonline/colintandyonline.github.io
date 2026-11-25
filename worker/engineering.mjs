const HOST = "engineering.ctdigital.group";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "X-CTDG-Source-Commit": env.SOURCE_COMMIT,
      "X-Robots-Tag": "noindex",
      "Cache-Control": "no-cache"
    };
    const reply = (body, status, extra = {}) =>
      new Response(body, {status, headers: {...headers, ...extra}});
    if (url.hostname !== HOST) return reply("Not found", 404);
    if (!["GET", "HEAD"].includes(request.method))
      return reply("Method not allowed", 405, {Allow: "GET, HEAD"});
    if (url.pathname.endsWith("/")) url.pathname += "index.html";
    if (url.pathname.split("/").some(part => part.startsWith(".")))
      return reply("Not found", 404);
    const response = await env.ASSETS.fetch(new Request(url, request));
    const resultHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(headers)) resultHeaders.set(key, value);
    return new Response(request.method === "HEAD" ? null : response.body, {
      status: response.status, statusText: response.statusText, headers: resultHeaders
    });
  }
};
