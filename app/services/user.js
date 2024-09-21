import QRCode from "qrcode";
import axios from "axios";
import sharp from "sharp";

export const userService = {
  async generateQrCode(text, iconUrl) {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(text, {
        width: 500,
        errorCorrectionLevel: "H",
      });

      const { data: iconBuffer } = await axios.get(iconUrl, {
        responseType: "arraybuffer",
      });

      const resizedIconBuffer = await sharp(iconBuffer)
        .resize(150, 150)
        .toBuffer();

      const qrMetadata = await sharp(qrCodeBuffer).metadata();

      const qrWithIconBuffer = await sharp(qrCodeBuffer)
        .composite([
          {
            input: resizedIconBuffer,
            top: Math.floor(qrMetadata.height / 2) - 75,
            left: Math.floor(qrMetadata.width / 2) - 75,
          },
        ])
        .toBuffer();

      return qrWithIconBuffer;
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  },
};
