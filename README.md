# YourStable Redemption Server

A Node.js server that automatically processes expired redemption tickets for the YourStable protocol on the Sui blockchain.

## Overview

This server is responsible for monitoring and processing redemption tickets that have reached their expiration time. As the designated rebalance trigger address, this server ensures that expired USDC redemption tickets are processed in batches to maintain the protocol's stability and user experience.

## Features

- **Automated Ticket Processing**: Continuously monitors for expired redemption tickets
- **Batch Processing**: Efficiently processes multiple tickets in configurable batch sizes
- **Dry Run Validation**: Validates transactions before execution to prevent failures
- **Comprehensive Logging**: Detailed logging for monitoring and debugging
- **Mainnet Integration**: Connects directly to Sui mainnet for production operations

## How It Works

1. **Ticket Discovery**: Scans the blockchain for all USDC redemption tickets
2. **Expiration Check**: Filters tickets that have passed their `time_to_redeem` timestamp
3. **Batch Organization**: Groups expired tickets into batches for efficient processing
4. **Transaction Validation**: Performs dry runs to ensure transaction validity
5. **Execution**: Executes validated batch redemption transactions

## Prerequisites

- Node.js (v16 or higher)
- A Sui wallet keypair with sufficient SUI for transaction fees
- Access to Sui mainnet RPC endpoint

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd your-stable-redeem-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Sui wallet private key (hex format)
PRIVATE_KEY=your_private_key_here

# Optional: Custom batch size (default: see DEFAULT_BATCH_SIZE in const.ts)
BATCH_SIZE=100
```

### Batch Size Configuration

The server processes tickets in batches to optimize gas usage and transaction success rates. The default batch size is defined in `src/const.ts` and can be adjusted based on:

- Network conditions
- Gas limits
- Transaction complexity

## Usage

### Running the Server

```bash
# Production mode
npm start
```

### Manual Execution

```typescript
import { Keypair } from "@mysten/sui/cryptography";
import { YourStableClient } from "your-stable-sdk";
import { Server } from "./src/server";

// Initialize with your keypair
const keypair = Keypair.fromSecretKey(privateKey);
const yourStableClient = new YourStableClient();
const server = new Server(keypair, yourStableClient);

// Process expired tickets
await server.batchRedeem();
```

## Architecture

### Core Components

- **Server Class**: Main orchestrator for redemption operations
- **Batch Processing**: Handles ticket grouping and transaction batching
- **Utility Functions**: Helper functions for ticket discovery and data processing
- **Logging System**: Comprehensive logging for operations monitoring

### Transaction Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Get Tickets   │───▶│  Filter Expired  │───▶│  Create Batches │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Execute TX    │◀───│    Dry Run       │◀───│  Build TX       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Monitoring

The server provides detailed logging for:

- Ticket discovery and filtering
- Batch creation and sizing
- Transaction validation results
- Execution outcomes
- Error conditions

### Common Issues

1. **No Tickets Found**
   - Verify network connectivity
   - Check if tickets exist on the blockchain

2. **Transaction Failures**
   - Ensure sufficient SUI balance for gas fees
   - Verify keypair permissions
   - Check network congestion

3. **Dry Run Failures**
   - Review transaction parameters
   - Check protocol state changes
   - Validate ticket ownership
