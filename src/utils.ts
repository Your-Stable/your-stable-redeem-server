import {
  YourStableClient,
  type SUPPORTED_REDEMPTION_COIN,
} from "your-stable-sdk";
import { SuiClient } from "@mysten/sui/client";
import { DEFAULT_BATCH_SIZE } from "./const";

export async function getAllTicketInfos(
  suiClient: SuiClient,
  coin: SUPPORTED_REDEMPTION_COIN,
) {
  let cursor;
  let fetching = true;
  const totalTickets = [];
  while (fetching) {
    const { tickets, cursor: cursor_ } = await YourStableClient.getTicketInfos(
      suiClient,
      coin,
      DEFAULT_BATCH_SIZE,
      cursor ? Number(cursor) : undefined,
    );

    totalTickets.push(...tickets);
    cursor = cursor_;

    if (cursor_ == null) fetching = false;
  }

  return totalTickets;
}

export function splitIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}
