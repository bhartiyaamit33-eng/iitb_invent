export default {
  async fetch(request, env) {
    // Prefer static assets from /public (hero, logos, building photo).
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("INVENT site assets unavailable", { status: 500 });
  }
};
