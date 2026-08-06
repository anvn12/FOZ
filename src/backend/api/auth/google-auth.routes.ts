import { Router, type RequestHandler } from "express";
import { env } from "#backend/env.js";
import { processSocialAuth } from "#backend/services/social-auth.service.js";
import { clearRefreshCookieOptions } from "#backend/api/auth/auth.service.js";

export const googleAuthRouter: Router = Router();

googleAuthRouter.get("/google", (req, res) => {
  const mode = req.query.mode === "redirect" ? "redirect" : "popup";

  if (env.GOOGLE_CLIENT_ID) {
    const redirectUri = encodeURIComponent(env.GOOGLE_CALLBACK_URL);
    const scope = encodeURIComponent("openid profile email");
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&state=${mode}`;
    return res.redirect(googleUrl);
  }

  // Development/Test mock redirect
  const mockCallback = `${env.GOOGLE_CALLBACK_URL}?code=mock_google_code&state=${mode}`;
  return res.redirect(mockCallback);
});

import { getGoogleProfileFromCode } from "#backend/services/oauth-providers.service.js";

googleAuthRouter.get("/google/callback", async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const mode = (req.query.state as string) || "popup";

    if (!code) {
      return res.status(400).json({ error: { code: "INVALID_REQUEST", message: "Missing authorization code" } });
    }

    // Live OAuth2 token exchange with Google (or mock fallback if test code)
    const profile = await getGoogleProfileFromCode(code);
    if (req.query.mock_email) {
      profile.email = req.query.mock_email as string;
    }
    if (req.query.mock_name) {
      profile.displayName = req.query.mock_name as string;
    }

    const session = await processSocialAuth(profile);

    res.cookie(session.cookie.name, session.cookie.value, session.cookie.options);

    if (mode === "popup") {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Successful</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'SOCIAL_AUTH_SUCCESS', payload: ${JSON.stringify(session.auth)} }, '*');
                window.close();
              } else {
                window.location.href = '/?token=${encodeURIComponent(session.auth.accessToken)}';
              }
            </script>
          </body>
        </html>
      `);
    }

    return res.redirect(`${env.CORS_ORIGIN}/?token=${encodeURIComponent(session.auth.accessToken)}`);
  } catch (err: any) {
    console.error("Google Auth Callback Error:", err);
    const mode = (req.query.state as string) || "popup";
    const errorMessage = err?.message || "Google authentication failed";

    if (mode === "popup") {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Error</title></head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'SOCIAL_AUTH_ERROR', error: ${JSON.stringify(errorMessage)} }, '*');
                window.close();
              } else {
                alert(${JSON.stringify(errorMessage)});
                window.location.href = '/login';
              }
            </script>
          </body>
        </html>
      `);
    }

    next(err);
  }
});
