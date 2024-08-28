import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import TransportSpeculos from "./helper/SpeculosTransport";
import Transport from "@ledgerhq/hw-transport";
import AppBtc from "@ledgerhq/hw-app-btc";

import { listen } from "@ledgerhq/logs";
import { Transaction, TransactionOutput } from "@ledgerhq/hw-app-btc/lib/types";

listen((log) => console.log(log)); // optional, for logs

// Example values that need to be replaced with actual data

const path = "84'/1'/0'/0/0";
const senderAddress = "your_bech32_address";
const recipientAddress = "recipient_bech32_address";
const amount_to_send = 50000;

const previousTransactionId = "your_previous_txid";
const outputIndex = 0;
const scriptSig = ""; // For SegWit, scriptSig is empty
const sequence = 0xfffffffd;
const scriptPubKey = "scriptPubKey_hex";
const utxoAmount = 100000;
const version = 2;

const change_amount = utxoAmount - amount_to_send;

const previousTransaction: Transaction = {
  version: Buffer.from([0x02, 0x00, 0x00, 0x00]),
  inputs: [
    {
      prevout: Buffer.from(previousTransactionId, "hex"),
      script: Buffer.from(scriptSig, "hex"),
      sequence: Buffer.from([0xfd, 0xff, 0xff, 0xff]),
    },
  ],
  outputs: [
    {
      amount: Buffer.from(
        utxoAmount.toString(16).padStart(16, "0"),
        "hex"
      ).reverse(),
      script: Buffer.from(scriptPubKey, "hex"),
    },
  ],

  locktime: Buffer.from([0x00, 0x00, 0x00, 0x00]),
};

// Associated keyset path for the Ledger device
const associatedKeysets: string[] = [path];

const inputs: [
  [Transaction, number, string | null | undefined, number | null | undefined]
] = [[previousTransaction, outputIndex, path, sequence]];

const outputs: TransactionOutput[] = [
  {
    amount: Buffer.from(
      amount_to_send.toString(16).padStart(16, "0"),
      "hex"
    ).reverse(),
    script: Buffer.from(`0014${recipientAddress}`, "hex"),
  },
  {
    amount: Buffer.from(
      change_amount.toString(16).padStart(16, "0"),
      "hex"
    ).reverse(),
    script: Buffer.from(`0014${senderAddress}`, "hex"),
  },
];

async function getWalletPublicKey(
  transport: Transport,
  display: boolean = true,
  path: string
): Promise<{
  publicKey: string;
  bitcoinAddress: string;
  chainCode: string;
}> {
  try {
    const btc = new AppBtc({ transport });
    const data = await btc.getWalletPublicKey(path, {
      verify: display,
      format: "bech32",
    });
    console.log("--km_log--[index.ts]--(getWalletAddress)--data--", data);
    return data;
  } catch (error) {
    console.error("An error occurred while getting the wallet address:", error);
    throw error;
  }
}

async function signBitcoinTransaction(
  transport: Transport,
  inputs: [
    [Transaction, number, string | null | undefined, number | null | undefined]
  ],
  associatedKeysets: string[],
  outputs: TransactionOutput[]
): Promise<string> {
  try {
    const btc = new AppBtc({ transport });

    const rawTx = await btc.createPaymentTransaction({
      inputs,
      associatedKeysets,
      outputScriptHex: outputs[0].script.toString("hex"),
      lockTime: 0,
      segwit: true,
      additionals: ["bech32"],
    });

    await transport.close();

    return rawTx;
  } catch (error) {
    console.error("An error occurred while signing the transaction:", error);
    throw error;
  }
}

async function main() {
  // Create transport
  const speculosUrl = "http://localhost:5000";
  const transport = new TransportSpeculos(speculosUrl);

  // Get wallet public key
  const walletPublicKey = await getWalletPublicKey(transport, true, path);
  // // Sign transaction
  // const signedTx = await signBitcoinTransaction(
  //   transport,
  //   inputs,
  //   associatedKeysets,
  //   outputs
  // );
  // console.log("Signed transaction:", signedTx);
  await transport.close();
  return true;
}

main()
  .then((result) => {
    console.log("Result:", result);
  })
  .catch(console.error);
