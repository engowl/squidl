// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import { Host, Result } from "@oasisprotocol/sapphire-contracts/contracts/OPL.sol";

import { EthereumUtils } from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import { Secp256k1 } from "./Secp256k1.sol";

interface ExtendedResolver {
    function resolve(bytes calldata name, bytes calldata data) external view returns(bytes memory);
}

error OffchainLookup(
    address sender,
    string[] urls,
    bytes callData,
    bytes4 callbackFunction,
    bytes extraData
);

struct SignatureRSV {
    bytes32 r;
    bytes32 s;
    uint256 v;
}

contract StealthResolverSdk is Host, ExtendedResolver {
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    string public constant SIGNIN_TYPE = "SignIn(address user,uint32 time)";
    bytes32 public constant SIGNIN_TYPEHASH = keccak256(bytes(SIGNIN_TYPE));
    bytes32 public immutable DOMAIN_SEPARATOR;

    string[] public urls;

    struct SignIn {
        address user;
        uint32 time;
        SignatureRSV rsv;
    }

    struct MetaAddress {
        bytes spendPub;
        bytes viewingPub;
    }

    // Store nameHash node to metaAddress mapping
    mapping(bytes32 => MetaAddress) public addresses;

    constructor(address otherEnd, string[] memory _urls)
        Host(otherEnd)
    {
        urls = _urls;

        registerEndpoint("registerCallback", registerCallback);

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            keccak256("SignInExample.SignIn"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }

    modifier authenticated(SignIn calldata auth)
    {
        // Must be signed within 24 hours ago.
        require( auth.time > (block.timestamp - (60*60*24)) );

        // Validate EIP-712 sign-in authentication.
        bytes32 authdataDigest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(
                SIGNIN_TYPEHASH,
                auth.user,
                auth.time
            ))
        ));

        address recovered_address = ecrecover(
            authdataDigest, uint8(auth.rsv.v), auth.rsv.r, auth.rsv.s);

        require( auth.user == recovered_address, "Invalid Sign-In" );

        _;
    }

    function register(SignIn calldata auth, bytes32 node)
        external payable
        authenticated(auth)
    {
        postMessage("register", abi.encode(auth, node));
    }

    function registerCallback(bytes calldata _args)
        internal
        returns(Result)
    {
        (bytes32 node, MetaAddress memory metaAddress) = abi.decode(_args, (bytes32, MetaAddress));
        addresses[node] = metaAddress;
        return Result.Success;
    }

    function resolve(bytes calldata name, bytes calldata data) external view override returns (bytes memory) {
        // This is a stub example for off-chain lookup.
        // You could encode some data here to send to the off-chain service.
        bytes memory callData = abi.encode(name, data);

        // Extra data could be used to pass metadata or verification data (optional)
        bytes memory extraData = abi.encode(data);

        // Trigger the OffchainLookup error to signal off-chain resolution
        revert OffchainLookup(
            address(this),       // Sender (this contract)
            urls,                // The list of URLs for off-chain lookups
            callData,            // The data to pass to the off-chain service
            this.resolveCallback.selector, // The callback function selector
            extraData            // Extra data that will be passed along with the response
        );
    }

    // Callback function that the off-chain resolver will call with the resolved data
    function resolveCallback(bytes calldata response, bytes calldata extraData) external view returns (bytes memory) {
        (bytes32 node) = abi.decode(extraData, (bytes32));
        bytes32 ephemeralKey = abi.decode(response, (bytes32));

        MetaAddress memory metaAddress = addresses[node];
        (address stealthAddress, ) = generateStealthAddress(metaAddress.spendPub, metaAddress.viewingPub, 0, ephemeralKey);

        return abi.encode(stealthAddress);
    }

    function generateStealthAddress(bytes memory spendPub, bytes memory viewingPub, uint32 k, bytes32 ephemeralKey)
        public view
        returns (address stealthAddress, bytes1 viewHint)
    {
        // Generate a random 32-byte entropy ephemeral private key Offchain that is less than the secp256k1 group order.

        // (uint256 viewingPubX, uint256 viewingPubY) = Secp256k1.deriveXY(viewingPub);
        (uint256 viewingPubX, uint256 viewingPubY) = EthereumUtils.k256Decompress(viewingPub);

        // A shared secret is computed as p-ephemeral·P-view
        // Let ecdh_shared_secret = a·Bscan
        (uint256 sX, uint256 sY) = Secp256k1.ecMul(uint256(ephemeralKey), viewingPubX, viewingPubY);

        // Let k = 0
        // uint32 k = 0;

        // The shared secret is hashed.
        // Let tk = hash/SharedSecret(serP(ecdh_shared_secret) || ser32(k))
        bytes32 sKey = keccak256(abi.encodePacked(bytes32(sX), bytes32(sY), k));

        // If tk is not valid tweak, i.e., if tk = 0 or tk is larger or equal to the secp256k1 group order, fail
        require(uint256(sKey) < Secp256k1.NN, "tweak is too large");

        // The view tag is extracted by taking the most significant byte of the shared secret.
        viewHint = sKey[0];

        // Multiply the hashed shared secret with the generator point, and add it to P-spend.
        // Let Pmn = Bm + tk·G
        (uint256 sPubX, uint256 sPubY) = Secp256k1.derivePubKey(uint256(sKey));
        (uint256 spendPubX, uint256 spendPubY) = EthereumUtils.k256Decompress(spendPub);
        (uint256 stealthPubX, uint256 stealthPubY) = Secp256k1.ecAdd(spendPubX, spendPubY, sPubX, sPubY);

        // Encode Pk or Pmn as an Ethereum address
        // stealthAddress = EthereumUtils.toEthereumAddress(stealthPubX, stealthPubY);
        stealthAddress = address(uint160(uint256(keccak256(abi.encodePacked(stealthPubX, stealthPubY)))));
    }
}