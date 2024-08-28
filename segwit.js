import { AppClient, DefaultWalletPolicy, WalletPolicy } from 'ledger-bitcoin';
import Transport from '@ledgerhq/hw-transport-node-hid';

async function main(transport, derivationPath) {
    const app = new AppClient(transport);

    // ==> Get the master key fingerprint
    const fpr = await app.getMasterFingerprint();
    console.log("Master key fingerprint:", fpr.toString("hex"));

    // ==> Get and display on screen the first address using the parameterized derivation path
    const accountPubkey = await app.getExtendedPubkey(derivationPath);
    const accountPolicy = new DefaultWalletPolicy(
        "wpkh(@0/**)",
        `[${fpr}${derivationPath.slice(1)}]${accountPubkey}`
    );

    console.log(accountPolicy);
    const accountAddress = await app.getWalletAddress(
        accountPolicy,
        null,
        0,
        0,
        true // show address on the wallet's screen
    );

    console.log("Account receive address:", accountAddress);

    // // ==> Register a multisig wallet named "Cold storage" with the parameterized derivation path

    // const ourPubkey = await app.getExtendedPubkey("m/48'/1'/0'/2'");
    // const ourKeyInfo = `[${fpr}/48'/1'/0'/2']${ourPubkey}`;
    // const otherKeyInfo = "[76223a6e/48'/1'/0'/2']tpubDE7NQymr4AFtewpAsWtnreyq9ghkzQBXpCZjWLFVRAvnbf7vya2eMTvT2fPapNqL8SuVvLQdbUbMfWLVDCZKnsEBqp6UK93QEzL8Ck23AwF";

    // const multisigPolicy = new WalletPolicy(
    //     "Cold storage",
    //     "wsh(sortedmulti(2,@0/**,@1/**))", // a 2-of-2 multisig policy template
    //     [
    //         otherKeyInfo, // some other bitcoiner
    //         ourKeyInfo,   // that's us
    //     ]
    // );

    // const [policyId, policyHmac] = await app.registerWallet(multisigPolicy);

    // console.log(`Policy hmac: ${policyHmac.toString("hex")}. Store it safely (together with the policy).`);

    // console.assert(policyId.compare(multisigPolicy.getId()) == 0);  // should never fail

    // // ==> Derive and show an address for "Cold storage" that was just registered

    // const multisigAddress = await app.getWalletAddress(multisigPolicy, policyHmac, 0, 0, true);
    // console.log(`Multisig wallet address: ${multisigAddress}`);

    // ==> Sign a psbt

    // TODO: set a wallet policy and a valid psbt file in order to test psbt signing
    const psbt = null; // a base64-encoded psbt, or a binary psbt in a Buffer
    const signingPolicy = null; // an instance of WalletPolicy
    const signingPolicyHmac = null; // if not a default wallet policy, this must also be set
    if (!psbt || !signingPolicy) {
        console.log("Nothing to sign :(");
        await transport.close();
        return;
    }

    // result will be a list of triples [i, partialSig], where:
    // - i is the input index
    // - partialSig is an instance of PartialSignature; it contains a pubkey and a signature,
    //   and it might contain a tapleaf_hash.
    const result = await app.signPsbt(psbt, signingPolicy, signingPolicyHmac);

    console.log("Returned signatures:");
    console.log(result);

    await transport.close();
}

Transport.default.create()
    .then(transport => main(transport, "m/84'/1'/0'")) // you can change the derivation path here
    .catch(console.log);