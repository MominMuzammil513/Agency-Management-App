import { EventEmitter } from "events";

// Global variable taaki production mein garbage collect na ho
declare global {
  var eventEmitter: EventEmitter | undefined;
}

export const eventEmitter = global.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  global.eventEmitter = eventEmitter;
}
