import { onRequest } from "firebase-functions/v2/https";

export const ping = onRequest({ 
  timeoutSeconds: 30,
  region: "us-central1", 
  memory: "256MiB" 
}, (request, response) => {
  response.send("pong");
});
