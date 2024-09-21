import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("StealthSigner", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployStealthSignerFixture() {
    // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.ethers.getSigners();

    const StealthSigner = await hre.ethers.getContractFactory("StealthSigner");
    const stealthSigner = await StealthSigner.deploy({ value: lockedAmount });

    return { stealthSigner, lockedAmount, owner };
  }

  describe("Deployment", function () {
    it("Should set the right viewingPub", async function () {
      const { stealthSigner } = await loadFixture(deployStealthSignerFixture);

      console.log(await stealthSigner.viewingPub());

      expect(await stealthSigner.viewingPub()).to.equal(0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5);
      });

    it("Should set the right spendPub0", async function () {
      const { stealthSigner } = await loadFixture(deployStealthSignerFixture);

      expect(await stealthSigner.spendPub0()).to.equal(0x02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9);
    });

    // it("Should set the right owner", async function () {
    //   const { lock, owner } = await loadFixture(deployStealthSignerFixture);

    //   expect(await lock.owner()).to.equal(owner.address);
    // });

    // it("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(
    //     deployStealthSignerFixture
    //   );

    //   expect(await hre.ethers.provider.getBalance(lock.target)).to.equal(
    //     lockedAmount
    //   );
    // });

    // it("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await hre.ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //     "Unlock time should be in the future"
    //   );
    // });
  });

  describe("StealthAddress", function () {
    describe("Generation", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { stealthSigner } = await loadFixture(deployStealthSignerFixture);

        await expect(stealthSigner.generateStealthAddress()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      // it("Should revert with the right error if called from another account", async function () {
      //   const { lock, unlockTime, otherAccount } = await loadFixture(
      //     deployStealthSignerFixture
      //   );

      //   // We can increase the time in Hardhat Network
      //   await time.increaseTo(unlockTime);

      //   // We use lock.connect() to send a transaction from another account
      //   await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
      //     "You aren't the owner"
      //   );
      // });

      // it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
      //   const { lock, unlockTime } = await loadFixture(
      //     deployStealthSignerFixture
      //   );

      //   // Transactions are sent using the first signer by default
      //   await time.increaseTo(unlockTime);

      //   await expect(lock.withdraw()).not.to.be.reverted;
      // });
    });

    // describe("Events", function () {
    //   it("Should emit an event on withdrawals", async function () {
    //     const { lock, unlockTime, lockedAmount } = await loadFixture(
    //       deployStealthSignerFixture
    //     );

    //     await time.increaseTo(unlockTime);

    //     await expect(lock.withdraw())
    //       .to.emit(lock, "Withdrawal")
    //       .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
    //   });
    // });

    // describe("Transfers", function () {
    //   it("Should transfer the funds to the owner", async function () {
    //     const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
    //       deployStealthSignerFixture
    //     );

    //     await time.increaseTo(unlockTime);

    //     await expect(lock.withdraw()).to.changeEtherBalances(
    //       [owner, lock],
    //       [lockedAmount, -lockedAmount]
    //     );
    //   });
    // });
  });
});
