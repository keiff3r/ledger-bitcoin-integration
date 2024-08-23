import { AppClient, DefaultWalletPolicy, WalletPolicy } from 'ledger-bitcoin';
import Transport from '@ledgerhq/hw-transport-node-hid';
import { listen, log } from "@ledgerhq/logs";

listen(log => console.log(log));

const mainnet = false;
const currency =  mainnet  ? 'bitcoin':'bitcoin_testnet';
const derivationPath = mainnet ? "44'/0'/0'/0/0" : "44'/1'/0'/0/0";

async function main(transport) {
    const app = new AppClient(transport);

     // ==> Get the master key fingerprint
     const fpr = await app.getMasterFingerprint();
     console.log("---------------------------------------------Master key fingerprint:", fpr.toString("hex"));
 
     // ==> Get and display on screen the first segwit address
    const firstSegwitAccountPubkey = await app.getExtendedPubkey(derivationPath);
    console.log("---------------------------------------------First segwit account pubkey:", firstSegwitAccountPubkey);
    const firstSegwitAccountPolicy = new DefaultWalletPolicy(
        "wpkh(@0/**)",
        `[${fpr}${derivationPath}]${firstSegwitAccountPubkey}`
    );

    const firstSegwitAccountAddress = await app.getWalletAddress(
        firstSegwitAccountPolicy,
        null,
        0,
        0,
        true // show address on the wallet's screen
    );

    console.log("---------------------------------------------First segwit account receive address:", firstSegwitAccountAddress);
}

Transport.default.create()
    .then(main)
    .catch(console.log);
