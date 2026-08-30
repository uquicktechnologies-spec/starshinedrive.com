import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import router from "./routes";
import { logger } from "./lib/logger";
import { requestTimeout } from "./middlewares/requestTimeout";

const app: Express = express();

// Sessions are backed by Postgres (not memory) so login state survives
// restarts and is shared across multiple autoscale instances -- an
// in-memory session store would silently log staff out whenever a request
// landed on a different instance.
const PgSession = connectPgSimple(session);
const sessionPool = new Pool({ connectionString: process.env.DATABASE_URL });

// connect-pg-simple's own createTableIfMissing reads a table.sql asset file
// at runtime, which esbuild's bundling doesn't carry into dist/ -- it 500s
// in production with an ENOENT for that file. Create the table ourselves
// (idempotent) instead, and disable its built-in creation below.
async function ensureSessionTable(): Promise<void> {
  await sessionPool.query(`
    CREATE TABLE IF NOT EXISTS "user_sessions" (
      "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
  `);
}
void ensureSessionTable();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new PgSession({ pool: sessionPool, tableName: "user_sessions", createTableIfMissing: false }),
    secret: process.env.SESSION_SECRET ?? "",
    resave: false,
    saveUninitialized: false,
    name: "starshine.sid",
    // No default maxAge here -- a session starts as a plain browser-session
    // cookie (dies when the browser closes). `POST /auth/login` sets a
    // persistent maxAge on top of this per-login, only when the caller opts
    // into "Remember me" -- see REMEMBER_ME_MAX_AGE_MS in routes/auth.ts.
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

app.use("/api", requestTimeout(), router);

// Global safety net: Express 5 forwards a rejected/throwing async handler to this
// automatically, so every route's DB/network error lands here instead of crashing
// the process or leaking a stack trace. Must be registered last and keep all four
// params so Express recognizes it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled request error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

export default app;
