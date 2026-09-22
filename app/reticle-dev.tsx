'use client';
import { useEffect } from 'react';

/** Dev-only: connect Reticle + install the React adapter, after hydration. */
export function ReticleDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    void import('@reticlehq/react').then(
      ({ reticle, install, registerCapabilities }) => {
        install();
        // Both provided by withReticle() in next.config. The bridge rejects a connect with no token;
        // the root makes source paths repo-relative instead of absolute.
        const token = process.env.NEXT_PUBLIC_RETICLE_TOKEN;
        const root = process.env.NEXT_PUBLIC_RETICLE_ROOT;
        // withReticle() finds the daemon serving this project on every dev-server start. It wins over
        // any port written into this file at install time, so moving the daemon needs no edit here.
        const url = process.env.NEXT_PUBLIC_RETICLE_URL;
        reticle.connect({
          projectId: 'iitbinvent-7d4eb21c', ...(url ? { url } : {}),
          ...(token ? { token } : {}),
          ...(root ? { root } : {}),
        });

        // ── Start with ONE flow. ────────────────────────────────────────────────────────────────
        // Registering a store is the highest-value line here: it lets the agent check what the app
        // BELIEVES, not just what it rendered. Pass the STORE, not `() => store.getState()` — the
        // store form wires `subscribe` too, so every mutation emits a diff; the getter form is
        // read-only.
        // No state library detected. If you add one, register it here — see node_modules/@reticlehq/server/docs/usage.md.
        registerCapabilities({
          testids: [
            // Chrome, present on every public page.
            "site-shell",
            "site-header",
            "site-footer",
            "nav",
            "nav-register",
            "nav-account",
            "nav-toggle",
            "nav-mobile",
            // Landing.
            "hero",
            "hero-register",
            "landing-research",
            "landing-research-cta",
            "partner-journals",
            "landing-sponsors",
            "sponsor-wall",
            "partner-wall",
            "landing-stats",
            "site-splash",
            // Research: the call for papers and the submission desk.
            "page-hero",
            "research-tracks",
            "research-journals",
            "conference-fee-bands",
            "conference-submit",
            "submit-login-gate",
            "submit-login-cta",
            "conference-form",
            "submit-application",
            "conference-status-card",
            // Auth.
            "login-email",
            "login-password",
            "login-submit",
            "signup-submit",
          ],
          signals: [],
          // No client state library in this app: pages are server-rendered and
          // read Prisma directly, so there is no store to register and
          // reticle_state is empty by design rather than by omission.
          stores: [],
        });
      },
    );
  }, []);
  return null;
}
