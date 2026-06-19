import { LogLayer } from "loglayer";
import pino from "pino";
import { PinoTransport } from "@loglayer/transport-pino";
import pretty from "pino-pretty";
import { fileURLToPath } from 'node:url';

const workerUrl = import.meta.resolve("../pino_worker.ts");
const transportPath = fileURLToPath(workerUrl);

const prettyStream = pretty({
  colorize: true,
  translateTime: "SYS:standard",
});

const rollTransport = pino.transport({
  target: transportPath,
  options: {
    file: "./logs/server",
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    extension: ".log",
    mkdir: true,
  }
});

const pinoTransport = pino(
  {
    level: Deno.env.get("LOG_LEVEL") || "debug",
    base: null, // Omit pid and hostname to reduce clutter
  },
  pino.multistream([
    { stream: prettyStream },
    { stream: rollTransport }
  ])
);

export const log = new LogLayer({
  transport: new PinoTransport({
    logger: pinoTransport,
  })
});
