import { Wallet } from "ethers";

// Replace with your private key
const privateKey = "0xc8a784674fb3edd1596fc255e95a39fb25111c7e627b76fbeab010af40bc3b8c";

// Create a wallet from the private key
const wallet = new Wallet(privateKey);

console.log("Address:", wallet.address);