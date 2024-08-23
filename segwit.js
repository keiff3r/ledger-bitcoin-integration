import { AppClient, DefaultWalletPolicy, WalletPolicy } from 'ledger-bitcoin';
import Transport from '@ledgerhq/hw-transport-node-hid';
import { listen, log } from "@ledgerhq/logs";

listen(log => console.log(log));

const mainnet = false;
const currency = mainnet ? 'bitcoin' : 'bitcoin_testnet';
const derivationPath = mainnet ? "m/44'/0'/0'" : "m/44'/1'/0'";

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
        `[${fpr}${derivationPath.substring(1,)}]${firstSegwitAccountPubkey}`
    );
    console.log("---------------------------------------------First segwit account policy:", firstSegwitAccountPolicy);
    // ex: "[72b31237/86'/1'/0']tpubDCuzMCrWQjpyaR6Bb46yv1VSMeDUfA95825ZC8egUZNo1NkALtQWkezSdKTcNYZ7HNKe4FhCADMHXy4w6CWGL1J2bPD9tgonfB3v4CmkGgd"
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
