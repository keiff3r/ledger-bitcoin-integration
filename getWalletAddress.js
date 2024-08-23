const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid");
const AppBtc = require("@ledgerhq/hw-app-btc");

async function getWalletAddress(path) {
    try {
        // Create a transport instance to communicate with the Ledger device
        const transport = await TransportNodeHid.create();
        const btc = new AppBtc(transport);

        // Get the public key and address for the specified path
        const result = await btc.getWalletPublicKey(path);

        // Log the derived address
        console.log("Bitcoin Address:", result.bitcoinAddress);

        return result.bitcoinAddress;
    } catch (error) {
        console.error("Error getting wallet address:", error);
        throw error;
    }
}

// Example usage
const path = "44'/0'/0'/0/0";
getWalletAddress(path).catch(error => {
    console.error("Failed to get wallet address:", error);
});