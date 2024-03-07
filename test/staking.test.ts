import { expect } from 'chai';
import { StakingFacet } from '../typechain-types/contracts/StakingFacet';
import { ExampleToken } from '../typechain-types/contracts/ExampleToken';
import { setupFixture } from './utils/fixture';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('Staking', () => {
  let deployer: SignerWithAddress;
  let exampleToken: ExampleToken;
  let stakingFacet: StakingFacet;
  const someRandomAddress = '0x720A4007fD5F34ce15cbe2C1021a846E848FF122';

  beforeEach(async () => {
    ({ deployer, stakingFacet, exampleToken } = await setupFixture());
  });

  describe('deposit', () => {
    it('reverts when token is not allowed', async () => {
      await expect(
        stakingFacet.deposit(someRandomAddress, 1)
      ).to.be.rejectedWith('StakingFacet: token not allowed');
    });

    it('reverts when amount is zero', async () => {
      await expect(
        stakingFacet.deposit(await exampleToken.getAddress(), 0)
      ).to.be.rejectedWith('StakingFacet: amount should be greater than 0');
    });

    it('reverts when there is no allowance', async () => {
      await expect(
        stakingFacet.deposit(await exampleToken.getAddress(), 1)
      ).to.be.revertedWith('StakingFacet: token allowance too low');
    });

    it('successfully deposits example token', async () => {
      const amount = 1;
      await exampleToken.approve(await stakingFacet.getAddress(), amount);
      await expect(
        stakingFacet.deposit(await exampleToken.getAddress(), amount)
      )
        .to.emit(stakingFacet, 'Deposit')
        .withArgs(
          await exampleToken.getAddress(),
          await deployer.getAddress(),
          amount
        );
    });
  });

  describe('withdraw', () => {
    beforeEach(async () => {
      await exampleToken.approve(await stakingFacet.getAddress(), 1);
      await stakingFacet.deposit(await exampleToken.getAddress(), 1);
    });

    it('reverts when amount is zero', async () => {
      await expect(
        stakingFacet.withdraw(await exampleToken.getAddress(), 0)
      ).to.be.revertedWith('StakingFacet: amount should be greater than 0');
    });

    it('reverts when amount is greater than deposited amount', async () => {
      await expect(
        stakingFacet.withdraw(await exampleToken.getAddress(), 2)
      ).to.be.revertedWith('StakingFacet: amount exceeds balance');
    });

    it('successfully withdraws deposited amount', async () => {
      await expect(stakingFacet.withdraw(await exampleToken.getAddress(), 1))
        .to.emit(stakingFacet, 'Withdraw')
        .withArgs(
          await exampleToken.getAddress(),
          await deployer.getAddress(),
          1
        );
    });
  });
});
