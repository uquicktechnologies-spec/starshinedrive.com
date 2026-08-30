import type { NextFunction, Request, Response } from "express";

/**
 * Bounds how long any `/api` request may run before the client gets a clean
 * JSON timeout response instead of hanging forever (e.g. a slow/blocked DB
 * query). Does not abort the underlying work -- Node has no safe way to
 * cancel an in-flight pg query from here -- it only stops making the client
 * wait once the deadline passes, and prevents a late handler from trying to
 * write to a response that's already been sent.
 */
export function requestTimeout(ms = 20_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({ error: "Request timed out. Please try again." });
      }
    }, ms);
    res.once("finish", () => clearTimeout(timer));
    res.once("close", () => clearTimeout(timer));
    next();
  };
}
