import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';
import { toHex } from 'viem/utils';

async function generateSeedAndAccount() {
  // Generate a random mnemonic seed (BIP-39, 12 words)
  const mnemonic = process.env.MNEMONIC || generateMnemonic(english);

  console.log("Generated Mnemonic Seed:", mnemonic);

  // Derive an Ethereum account from the generated mnemonic
  const account = mnemonicToAccount(mnemonic);

  console.log("Ethereum Address:", account.address);
  const privateKey = account.getHdKey().privateKey;
  if (privateKey) {
    console.log("Private Key:", toHex(privateKey));
  }
}

generateSeedAndAccount().catch(console.error);