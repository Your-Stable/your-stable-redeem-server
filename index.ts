import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { fromHEX } from "@mysten/sui/utils";
import * as dotenv from "dotenv";
import { createPrivateKey } from "crypto";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { CronJob } from "cron";
import { Server } from "./src/server";
import { logger } from "./src/logger";
import { YourStableClient } from "your-stable-sdk";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

dotenv.config();

const secret = process.env.ADMIN_PRIVATE_KEY!;
const { secretKey } = decodeSuiPrivateKey(secret);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

// async function start() {
//   const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
//   const yourStableClient = await YourStableClient.initialize(
//     client,
//     "0x26c842736665d461bd9a73c7a11ac69d64ec14015fdb5fd8f3c04c881a993f6a::jusd::JUSD",
//   );
//   const server = new Server(keypair, yourStableClient);
//   await server.batchRedeem();
// }
//
// start().catch(console.error);

const job = new CronJob("*/1 * * * *", async function () {
  const client = new SuiClient({ url: getFullnodeUrl("mainnet") });
  const yourStableClient = await YourStableClient.initialize(
    client,
    "0x26c842736665d461bd9a73c7a11ac69d64ec14015fdb5fd8f3c04c881a993f6a::jusd::JUSD",
  );
  const server = new Server(keypair, yourStableClient);
  try {
    await server.batchRedeem();
  } catch (error) {
    logger.error(error);
  } finally {
    logger.info("Finish");
  }
});

job.start();
