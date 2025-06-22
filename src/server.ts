import { Keypair } from "@mysten/sui/cryptography";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { dryRun, YourStableClient } from "your-stable-sdk";
import { Transaction } from "@mysten/sui/transactions";
import { batchRedeem } from "your-stable-sdk/_generated/your-stable/redemption-queue/functions";
import { logger } from "./logger";
import { getAllTicketInfos, splitIntoChunks } from "./utils";
import { DEFAULT_BATCH_SIZE } from "./const";

export class Server {
  private keypair: Keypair;
  private client: SuiClient;
  private yourStableClient: YourStableClient;

  constructor(keypair: Keypair, yourStableClient: YourStableClient) {
    this.keypair = keypair;
    this.client = new SuiClient({ url: getFullnodeUrl("mainnet") });
    this.yourStableClient = yourStableClient;
  }

  async batchRedeem() {
    const tx = new Transaction();

    // get ticket infos

    const usdcRedemptionTickets = await getAllTicketInfos(this.client, "USDC");

    const now = Date.now();
    const expiredRedemptionTickets = usdcRedemptionTickets
      .filter((ticket) => Number(ticket.time_to_redeem) <= now)
      .sort((a, b) => Number(a.ticket_id) - Number(b.ticket_id));

    if (!expiredRedemptionTickets?.[0]) {
      logger.info("No ticket to redeem");
      return;
    }

    const firstTicketIndex = Number(expiredRedemptionTickets[0].ticket_id);
    const batches = Math.ceil(
      (Number(
        expiredRedemptionTickets[expiredRedemptionTickets.length - 1]
          ?.ticket_id || 0,
      ) -
        firstTicketIndex +
        1) /
        DEFAULT_BATCH_SIZE,
    );
    logger.info({ expiredRedemptionTickets });
    logger.info({ batches });
    for (let index = 0; index < batches; index++) {
      const batchStart =
        Number(expiredRedemptionTickets[0]?.ticket_id || 0) +
        DEFAULT_BATCH_SIZE * index;
      const batchSize = BigInt(DEFAULT_BATCH_SIZE);

      YourStableClient.batchRedeemMoveCall(
        tx,
        "USDC",
        BigInt(batchStart),
        batchSize,
      );
    }

    const dryRunResponse = await dryRun(
      this.client,
      tx,
      this.keypair.toSuiAddress(),
    );

    if (dryRunResponse.dryrunRes.effects.status.status === "success") {
      // execute transaction if it's proper
      const response = await this.client.signAndExecuteTransaction({
        transaction: tx,
        signer: this.keypair,
      });

      logger.info({ response });
    } else {
      logger.error(dryRunResponse.dryrunRes.effects.status.error);
    }
  }
}
