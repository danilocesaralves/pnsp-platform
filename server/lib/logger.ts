import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
  base: { service: "pnsp-platform" },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

export type Logger = typeof logger;

// Child loggers for each domain
export const dbLogger = logger.child({ module: "db" });
export const authLogger = logger.child({ module: "auth" });
export const trpcLogger = logger.child({ module: "trpc" });
export const stripeLogger = logger.child({ module: "stripe" });
export const mapsLogger = logger.child({ module: "maps" });
export const serverLogger = logger.child({ module: "server" });
