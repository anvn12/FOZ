import { Router } from "express";
import { env } from "#backend/env.js";
import { processSocialAuth } from "#backend/services/social-auth.service.ts";

export const facebookAuthRouter: Router = Router();

facebookAuthRouter.get("/facebook", (req, res) => {
  const mode = req.query.mode === "redirect" ? "redirect" : "popup";

  if (env.FACEBOOK_APP_ID) {
    const redirectUri = encodeURIComponent(env.FACEBOOK_CALLBACK_URL);
    const scope = encodeURIComponent("email,public_profile");
    const fbUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&state=${mode}`;
    return res.redirect(fbUrl);
  }

  // Development/Test mock redirect
  const mockCallback = `${env.FACEBOOK_CALLBACK_URL}?code=mock_facebook_code&state=${mode}`;
  return res.redirect(mockCallback);
});

import { getFacebookProfileFromCode } from "#backend/services/oauth-providers.service.js";

facebookAuthRouter.get("/facebook/callback", async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const mode = (req.query.state as string) || "popup";

    if (!code) {
      return res.status(400).json({ error: { code: "INVALID_REQUEST", message: "Missing authorization code" } });
    }

    // Live OAuth2 token exchange with Facebook (or mock fallback if test code)
    const profile = await getFacebookProfileFromCode(code);
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
    console.error("Facebook Auth Callback Error:", err);
    const mode = (req.query.state as string) || "popup";
    const errorMessage = err?.message || "Facebook authentication failed";

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
