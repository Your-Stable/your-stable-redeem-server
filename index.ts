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
//     "0x5de877a152233bdd59c7269e2b710376ca271671e9dd11076b1ff261b2fd113c::up_usd::UP_USD",
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
    "0x5de877a152233bdd59c7269e2b710376ca271671e9dd11076b1ff261b2fd113c::up_usd::UP_USD",
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
