// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import { EllipticCurve } from "elliptic-curve-solidity/contracts/EllipticCurve.sol";

library Secp256k1 {
    uint256 public constant GX =
        0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 public constant GY =
        0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 public constant AA = 0;
    uint256 public constant BB = 7;
    uint256 public constant PP =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;
    uint256 public constant NN =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;

    /// @notice Elliptic curve multiplication
    /// @param scalar The scalar to multiply by
    /// @param x The x coordinate of the point
    /// @param y The y coordinate of the point
    function ecMul(uint256 scalar, uint256 x, uint256 y)
        internal pure returns (uint256, uint256)
    {
        return EllipticCurve.ecMul(scalar, x, y, AA, PP);
    }

    /// @notice Elliptic curve addition
    /// @param x1 The x coordinate of the first point
    /// @param y1 The y coordinate of the first point
    /// @param x2 The x coordinate of the second point    
    /// @param y2 The y coordinate of the second point
    function ecAdd(uint256 x1, uint256 y1, uint256 x2, uint256 y2)
        internal pure returns (uint256, uint256)
    {
        return EllipticCurve.ecAdd(x1, y1, x2, y2, AA, PP);
    }

    /// @notice Inverse of point (x, y).
    /// @param x The x coordinate of the point
    /// @param y The y coordinate of the point
    function ecInv(uint256 x, uint256 y)
        internal pure returns (uint256, uint256)
    {
        return EllipticCurve.ecInv(x, y, PP);
    }

    /// @notice Public Key derivation from private key
    /// @param privKey The private key
    /// @return (qx, qy) The Public Key
    function derivePubKey(uint256 privKey)
        internal pure returns (uint256, uint256)
    {
        return EllipticCurve.ecMul(privKey, GX, GY, AA, PP);
    }

    /// @notice Public Key derivation from compressed public key
    /// @param pubKey The compressed public key
    /// @return (qx, qy) The uncompressed Public Key
    function deriveXY(bytes calldata pubKey)
        internal pure returns (uint256, uint256)
    {
        uint8 prefix = uint8(pubKey[0]);
        uint256 x = abi.decode(pubKey[1:], (uint256));
        return (x, EllipticCurve.deriveY(prefix, x, AA, BB, PP));
    }
}
