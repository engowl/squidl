// Usage: pnpm hardhat run --network <network> scripts/run-vigil.ts

import { ethers } from 'hardhat';

async function main() {
  const StealthSigner = await ethers.getContractFactory('StealthSigner');
  const [scanner] = await ethers.getSigners();
  const stealthSigner = await StealthSigner.deploy(scanner);
  console.log('StealthSigner deployed to:', await stealthSigner.getAddress());
  console.log('Viewing Public Key:', await stealthSigner.viewingPub());
  console.log('Spend Public Key:', await stealthSigner.spendPub());

  // const tx = await stealthSigner.generateStealthAddress();
  // console.log('Storing a secret in', tx.hash);
  // await tx.wait();
  try {
    const labelIndex = 0;

    console.log('Checking the address');
    const [address1, ePub1, tag1] = await stealthSigner.connect(ethers.provider).generateStealthAddress.staticCall(labelIndex)
    console.log([address1, ePub1, tag1]);
    console.log(await stealthSigner.checkStealthAddress.staticCall(labelIndex, ePub1, tag1));
    const [key1, addr1] = await stealthSigner.computeStealthKey.staticCall(labelIndex, ePub1);

    if (addr1 !== address1) {
      console.log('Uh oh. The address is incorrect!', [address1, addr1]);
      process.exit(1);
    }

    const wallet1 = new ethers.Wallet(key1);
    if (wallet1.address !== address1) {
      console.log('Uh oh. The stealth key is incorrect!', [address1, wallet1.address]);
      process.exit(1);
    }

    const [address2, ePub2, tag2] = await stealthSigner.connect(ethers.provider).generateStealthAddress.staticCall(labelIndex)
    console.log([address2, ePub2, tag2]);
    console.log(await stealthSigner.checkStealthAddress.staticCall(labelIndex, ePub2, tag2));
    const [key2, addr2] = await stealthSigner.computeStealthKey.staticCall(labelIndex, ePub2);

    if (addr2 !== address2) {
      console.log('Uh oh. The address is incorrect!', [address2, addr2]);
      process.exit(1);
    }

    const wallet2 = new ethers.Wallet(key2);
    if (wallet2.address !== address2) {
      console.log('Uh oh. The stealth key is incorrect!', [address2, wallet2.address]);
      process.exit(1);
    }

    const nonce = 0;
    const feeData = await ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice || 20_000;
    const network = await ethers.provider.getNetwork();
    const rawTx = await stealthSigner.createTransaction.staticCall(
      0,
      ePub2,
      nonce,
      gasPrice,
      network.chainId,
    );
    console.log("Transaction Bytes:", rawTx);
    const tx = ethers.Transaction.from(rawTx);
    console.log(`Transaction (isSigned: ${tx.isSigned()}):`, tx);

  } catch (e: any) {
    console.log('failed to fetch address:', e.message);
  }
  console.log('Waiting...');

  // Manually generate some transactions to increment local Docker
  // container block
  if ((await ethers.provider.getNetwork()).name == 'sapphire_localnet') {
    await generateTraffic(10);
  }

  await new Promise((resolve) => setTimeout(resolve, 30_000));
  console.log('Checking the address again');
  await (await stealthSigner.generateStealthAddress(0)).wait(); // Reveal the secret.
  const address = await stealthSigner.generateStealthAddress.staticCallResult(0); // Get the value.
  console.log('The secret ingredient is', address);
}

async function generateTraffic(n: number) {
  const signer = await ethers.provider.getSigner();
  for (let i = 0; i < n; i++) {
    await signer.sendTransaction({
      to: "0x000000000000000000000000000000000000dEaD",
      value: ethers.parseEther("1.0"),
      data: "0x"
    });
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});