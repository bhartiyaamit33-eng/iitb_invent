/**
 * Legacy Cloudflare Worker — serves static assets from ../public.
 * Kept until DNS cutover from Cloudflare → Amplify after M2 acceptance.
 */
export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("INVENT site assets unavailable", { status: 500 });
  },
};
