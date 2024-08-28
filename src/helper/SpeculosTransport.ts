import Transport from "@ledgerhq/hw-transport";
import axios from "axios";

export default class TransportSpeculos extends Transport {
  speculosUrl: string;

  constructor(speculosUrl: string) {
    super();
    this.speculosUrl = speculosUrl;
  }

  async exchange(_apdu: Buffer): Promise<Buffer> {
    try {
      const response = await axios.post(`${this.speculosUrl}/apdu`, {
        data: _apdu.toString("hex"),
      });
      console.log(
        "--km_log--[SpeculosTransport.ts]--(exchange)--response--",
        response.data
      );
      return Buffer.from(response.data.data, "hex");
    } catch (error) {
      console.error("Error communicating with Speculos:", error);
      throw error;
    }
  }

  setScrambleKey() {
    // No need for scrambling in Speculos
  }

  async close() {
    // No cleanup needed for Speculos
  }
}

async function createSpeculosTransport(
  speculosUrl: string
): Promise<Transport> {
  return new TransportSpeculos(speculosUrl);
}
