import { Router, type IRouter, type Request } from "express";
import { verifyStaffCredentials, verifyMasterAdmin, createStaffAccount } from "../lib/staffAuth";

const router: IRouter = Router();

const REMEMBER_ME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * "Remember me" (default on -- unchecking it is the opt-out, since most staff
 * expect not to be asked to sign in again on their own device). When on, the
 * session cookie gets a 30-day maxAge so it survives closing the browser.
 * When off, we leave it alone: app.ts's session() cookie defaults set no
 * maxAge/expires, and req.session.regenerate() (called just before this)
 * always builds the new cookie from those defaults, so a freshly-regenerated
 * session is already a plain browser-session cookie (dies when the browser
 * closes) unless we add a maxAge here. Either way this is a normal httpOnly
 * session cookie -- the password itself is never stored client-side.
 */
function applyRememberMe(req: Request, rememberMe: boolean): void {
  if (rememberMe) {
    req.session.cookie.maxAge = REMEMBER_ME_MAX_AGE_MS;
  }
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { email, password, name } = (req.body ?? {}) as { email?: unknown; password?: unknown; name?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const result = await createStaffAccount(email, password, typeof name === "string" ? name : undefined);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(201).json({ ok: true, email: result.email });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password, rememberMe } = (req.body ?? {}) as { email?: unknown; password?: unknown; rememberMe?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const remember = rememberMe !== false;

  // Hidden master-admin backup login: checked first, against secrets only
  // (no DB row). Uses the same "email" field as a username so the frontend
  // doesn't need a second form.
  if (verifyMasterAdmin(email, password)) {
    req.session.regenerate((err) => {
      if (err) { res.status(500).json({ error: "Could not start session" }); return; }
      req.session.isMasterAdmin = true;
      req.session.staffEmail = undefined;
      applyRememberMe(req, remember);
      req.session.save((saveErr) => {
        if (saveErr) { res.status(500).json({ error: "Could not start session" }); return; }
        res.json({ ok: true });
      });
    });
    return;
  }

  const verifiedEmail = await verifyStaffCredentials(email, password);
  if (!verifiedEmail) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) { res.status(500).json({ error: "Could not start session" }); return; }
    req.session.staffEmail = verifiedEmail;
    req.session.isMasterAdmin = false;
    applyRememberMe(req, remember);
    req.session.save((saveErr) => {
      if (saveErr) { res.status(500).json({ error: "Could not start session" }); return; }
      res.json({ ok: true });
    });
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("starshine.sid");
    res.json({ ok: true });
  });
});

export default router;
