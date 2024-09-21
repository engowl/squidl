// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import { Sapphire } from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import { EthereumUtils } from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import { Secp256k1 } from "./Secp256k1.sol";

contract StealthSigner {
    address public scanner;

    bytes32 private viewingKey;
    bytes public viewingPub;
    // uint256 public viewingPubX;
    // uint256 public viewingPubY;

    bytes32 private spendKey;
    bytes public spendPub;
    // uint256 public spendPubX;
    // uint256 public spendPubY;

    constructor (address _scanner)
        payable
    {
        scanner = _scanner;

        // Test Vectors
        viewingKey = 0x0000000000000000000000000000000000000000000000000000000000000002;
        viewingPub = derivePubKey(bytes.concat(viewingKey));
        // (viewingPubX, viewingPubY) = EthereumUtils.k256Decompress(viewingPub);
        spendKey = 0x0000000000000000000000000000000000000000000000000000000000000003;
        spendPub = derivePubKey(bytes.concat(spendKey));
        // (spendPubX, spendPubY) = EthereumUtils.k256Decompress(spendPub);

        (viewingPub, viewingKey) = generateKeypair();
        (spendPub, spendKey) = generateKeypair();
    }

    function getMetaAddress()
        public view
        returns (string memory)
    {
        // TODO: Let Bm = Bspend + hash(bscan || m)·G where m is an incrementable integer starting from 1
        return string(abi.encodePacked("st:eth:0x", bytesToHex(spendPub), bytesToHex(viewingPub)));
    }

    function generateStealthAddress()
        public
        view
        returns (address stealthAddress, bytes memory ephemeralPub, bytes1 viewTag)
    {
        // Generate a random 32-byte entropy ephemeral private key .
        // For each private key ai, check that the private key produces a point with an even Y coordinate and negate the private key if not
        bytes32 ephemeralKey;
        (ephemeralPub, ephemeralKey) = generateKeypair();

        // Test Vectors
        // ephemeralKey = 0xd952fe0740d9d14011fc8ead3ab7de3c739d3aa93ce9254c10b0134d80d26a30;
        // ephemeralPub = derivePubKey(bytes.concat(ephemeralKey));

        // (uint256 viewingPubX, uint256 viewingPubY) = Secp256k1.deriveXY(viewingPub);
        (uint256 viewingPubX, uint256 viewingPubY) = EthereumUtils.k256Decompress(viewingPub);
        console.log("viewingPubX", viewingPubX, "viewingPubY", viewingPubY);

        // A shared secret is computed as p-ephemeral·P-view
        // Let ecdh_shared_secret = a·Bscan
        (uint256 sX, uint256 sY) = Secp256k1.ecMul(uint256(ephemeralKey), viewingPubX, viewingPubY);

        // Let k = 0
        uint32 k = 0;

        // The shared secret is hashed.
        // Let tk = hashBIP0352/SharedSecret(serP(ecdh_shared_secret) || ser32(k))
        bytes32 sKey = keccak256(abi.encodePacked(bytes32(sX), bytes32(sY), k));

        // If tk is not valid tweak, i.e., if tk = 0 or tk is larger or equal to the secp256k1 group order, fail
        require(uint256(sKey) < Secp256k1.NN, "tweak is too large");

        // The view tag is extracted by taking the most significant byte of the shared secret.
        viewTag = sKey[0];

        // Multiply the hashed shared secret with the generator point, and add it to P-spend.
        // Let Pmn = Bm + tk·G
        bytes memory sPub = derivePubKey(bytes.concat(sKey));
        // (uint256 sPubX, uint256 sPubY) = sPubYSecp256k1.deriveXY(sPub);
        (uint256 sPubX, uint256 sPubY) = EthereumUtils.k256Decompress(sPub);
        (uint256 spendPubX, uint256 spendPubY) = EthereumUtils.k256Decompress(spendPub);
        (uint256 stealthPubX, uint256 stealthPubY) = Secp256k1.ecAdd(spendPubX, spendPubY, sPubX, sPubY);

        // Encode Pk or Pmn as an Ethereum address
        // stealthAddress = EthereumUtils.toEthereumAddress(stealthPubX, stealthPubY);
        stealthAddress = address(uint160(uint256(keccak256(abi.encodePacked(stealthPubX, stealthPubY)))));
    }

    function checkStealthAddress(bytes calldata ephemeralPub, bytes1 viewTag)
        public
        view
        returns (address stealthAddress)
    {
        // TODO: only allow the scanner to call this function
        require(msg.sender == scanner, "only the scanner can call this function");

        // Let A = A1 + A2 + ... + An, where each Ai is the public key of an ephemeral key pair.
        (uint256 ephemeralPubX, uint256 ephemeralPubY) = EthereumUtils.k256Decompress(ephemeralPub);

        // Shared secret is computed by multiplying the viewing private key with the ephemeral public key of the announcement
        // Bob detects this payment by calculating P0 = Bspend + hash(input_hash·bscan·A || 0)·G with his online device
        // Let ecdh_shared_secret = bscan·A
        (uint256 sX, uint256 sY) = Secp256k1.ecMul(uint256(viewingKey), ephemeralPubX, ephemeralPubY);

        // Let k = 0
        uint32 k = 0;

        // Let tk = hashBIP0352/SharedSecret(serP(ecdh_shared_secret) || ser32(k))
        bytes32 sKey = keccak256(abi.encodePacked(bytes32(sX), bytes32(sY), k));

        // If tk is not valid tweak, i.e., if tk = 0 or tk is larger or equal to the secp256k1 group order, fail
        require(uint256(sKey) < Secp256k1.NN, "tweak is too large");

        // The view tag is extracted by taking the most significant byte and can be compared to the given view tag.
        // If the view tags do not match, this Announcement is not for the user and the remaining steps can be skipped. If the view tags match, continue on.
        require(sKey[0] == viewTag, "view tag mismatch");

        // Multiply the hashed shared secret with the generator point, and add it to P-spend.
        // Compute Pk = Bspend + tk·G
        // Let Pmn = Bm + tk·G
        bytes memory sPub = derivePubKey(bytes.concat(sKey));
        // (uint256 sPubX, uint256 sPubY) = sPubYSecp256k1.deriveXY(sPub);
        (uint256 sPubX, uint256 sPubY) = EthereumUtils.k256Decompress(sPub);
        (uint256 spendPubX, uint256 spendPubY) = EthereumUtils.k256Decompress(spendPub);
        (uint256 stealthPubX, uint256 stealthPubY) = Secp256k1.ecAdd(spendPubX, spendPubY, sPubX, sPubY);

        // Encode Pk or Pmn as an Ethereum address
        // stealthAddress = EthereumUtils.toEthereumAddress(stealthPubX, stealthPubY);
        stealthAddress = address(uint160(uint256(keccak256(abi.encodePacked(stealthPubX, stealthPubY)))));
    }

    function computeStealthKey(bytes calldata ephemeralPub)
        public
        view
        returns (bytes32 stealthKey, address stealthAddress)
    {
        // TODO: require EIP712 signed session

        // Let A = A1 + A2 + ... + An, where each Ai is the public key of an ephemeral key pair.
        (uint256 ephemeralPubX, uint256 ephemeralPubY) = EthereumUtils.k256Decompress(ephemeralPub);

        // Shared secret is computed by multiplying the viewing private key with the ephemeral public key of the announcement
        // Q = secp256k1.multiply(S, p_scan)
        (uint256 sX, uint256 sY) = Secp256k1.ecMul(uint256(viewingKey), ephemeralPubX, ephemeralPubY);

        // Let k = 0
        uint32 k = 0;

        // Let tk = hashBIP0352/SharedSecret(serP(ecdh_shared_secret) || ser32(k))
        // Q_hex = sha3.keccak_256(Q[0].to_bytes(32, "big")+Q[1].to_bytes(32, "big")).hexdigest()
        bytes32 sKey = keccak256(abi.encodePacked(bytes32(sX), bytes32(sY), k));

        // Bob can spend from his cold storage signing device using (bspend + hash(bscan·A || 0)) mod n as the private key.
        // Let d = (bspend + tk + hashBIP0352/Label(ser256(bscan) || ser32(m))) mod n, where hashBIP0352/Label(ser256(bscan) || ser32(m)) is the optional label
        stealthKey = bytes32(addmod(uint256(spendKey), uint256(sKey), Secp256k1.NN));

        bytes memory stealthPub = derivePubKey(bytes.concat(stealthKey));
        stealthAddress = EthereumUtils.k256PubkeyToEthereumAddress(stealthPub);
    }

    function bytesToHex(bytes memory buffer) internal pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(buffer.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return string(converted);
    }

    /**
     * @notice Generate an  SEC P256 k1 keypair (compressed)
     * @param privKey SEC P256 k1 private key.
     * @return pubKey SEC P256 k1 public key.
     */
    function derivePubKey(bytes memory privKey)
        internal
        view
        returns (bytes memory pubKey)
    {
        (pubKey, ) = Sapphire.generateSigningKeyPair(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            privKey
        );
    }

    /**
     * @notice Generate an  SEC P256 k1 keypair and
     * corresponding public address.
     * @return pubKey SEC P256 k1 pubkey.
     * @return secretKey Secret key used for signing.
     */
    function generateKeypair()
        internal
        view
        returns (bytes memory pubKey, bytes32 secretKey)
    {
        bytes memory randSeed = Sapphire.randomBytes(32, "");
        secretKey = bytes32(randSeed);
        (pubKey, ) = Sapphire.generateSigningKeyPair(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            randSeed
        );

        // uint8 prefix = uint8(pubKey[0]);
        // if (prefix == 0x03) {
        //     randSeed = abi.encodePacked(Secp256k1.NN - uint256(secretKey));
        //     secretKey = bytes32(randSeed);
        //     bytes32 pubX;
        //     assembly {
        //         pubX := mload(add(pubKey, 33))
        //     }
        //     pubKey = abi.encodePacked(uint8(0x02), pubX);
        // }
    }
}
