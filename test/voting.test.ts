import { expect } from 'chai';
import { StakingFacet } from '../typechain-types/contracts/StakingFacet';
import { ExampleToken } from '../typechain-types/contracts/ExampleToken';
import { setupFixture } from './utils/fixture';
import {
  VotingFacet,
  SurveyCreateStruct,
} from '../typechain-types/contracts/VotingFacet';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { increaseTime } from './utils/network';

describe('Voting', () => {
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let mat: SignerWithAddress;
  let exampleToken: ExampleToken;
  let stakingFacet: StakingFacet;
  let votingFacet: VotingFacet;
  const someRandomAddress = '0x720A4007fD5F34ce15cbe2C1021a846E848FF122';
  let exampleSurvey: SurveyCreateStruct;

  beforeEach(async () => {
    ({
      deployer,
      alice,
      bob,
      mat,
      stakingFacet,
      votingFacet,
      exampleToken
    } = await setupFixture());

    exampleSurvey = {
      token: exampleToken,
      name: 'example name',
      description: 'example description',
      votingStart: Math.round(new Date().getTime() / 1000),
      votingDeadline: ethers.MaxUint256,
    };

    await exampleToken.mint(
      await alice.getAddress(),
      ethers.parseEther('1000')
    );
    await exampleToken.mint(await bob.getAddress(), ethers.parseEther('1000'));

    await exampleToken
      .connect(alice)
      .approve(
        await stakingFacet.getAddress(),
        ethers.parseEther('1000').toString()
      );
    await stakingFacet
      .connect(alice)
      .deposit(await exampleToken.getAddress(), 1000);
  });

  describe('createSurvey', () => {
    it('reverts when wallet is not allowed to create survey', async () => {
      await expect(
        votingFacet.connect(alice).createSurvey(exampleSurvey)
      ).to.be.rejectedWith('VotingFacet: signer not allowed to create survey');
    });
    it('reverts when token is not allowed', async () => {
      await expect(
        votingFacet.createSurvey({ ...exampleSurvey, token: someRandomAddress })
      ).to.be.rejectedWith('VotingFacet: token not allowed');
    });
    it('reverts when survey voting start is after ', async () => {
      await expect(
        votingFacet.createSurvey({
          ...exampleSurvey,
          votingStart: 1000,
          votingDeadline: 0,
        })
      ).to.be.rejectedWith(
        'VotingFacet: voting start is after voting deadline'
      );
    });
    it('reverts when name is empty', async () => {
      await expect(
        votingFacet.createSurvey({
          ...exampleSurvey,
          name: '',
        })
      ).to.be.rejectedWith('VotingFacet: name cannot be empty');
    });
    it('reverts when voting deadline is in the past', async () => {
      await expect(
        votingFacet.createSurvey({
          ...exampleSurvey,
          votingStart: 0,
          votingDeadline: 1,
        })
      ).to.be.rejectedWith('VotingFacet: voting deadline is in the past');
    });

    it('reverts when balance of survey creator token balance is zero', async () => {
      await votingFacet.addToAllowedCreators(await mat.getAddress());

      await expect(
        votingFacet.connect(mat).createSurvey(exampleSurvey)
      ).to.be.rejectedWith(
        'VotingFacet: survey creator must have token balance to create survey'
      );
    });

    it('sucessfully creates survey', async () => {
      const expectedSurveyId = 0;

      await expect(votingFacet.createSurvey(exampleSurvey))
        .to.emit(votingFacet, 'SurveyCreated')
        .withArgs(
          exampleSurvey.token,
          await deployer.getAddress(),
          expectedSurveyId
        );
    });
  });

  describe('vote', () => {
    const timeInNearFuture = Math.round(new Date().getTime() / 1000 + 1000);
    beforeEach(async () => {
      await votingFacet.createSurvey({
        ...exampleSurvey,
        votingStart: timeInNearFuture,
      });
      await increaseTime(1000);
    });

    it('reverts when survey does not exist', async () => {
      await expect(votingFacet.vote(1, true)).to.be.rejectedWith(
        'VotingFacet: survey does not exist'
      );
    });

    it('reverts when survey has not started', async () => {
      await votingFacet.createSurvey({
        ...exampleSurvey,
        votingStart: ethers.MaxUint256 - 1n,
      });

      await expect(votingFacet.vote(1, true)).to.be.rejectedWith(
        'VotingFacet: voting has not started'
      );
    });

    it('reverts when survey has ended', async () => {
      await votingFacet.createSurvey({
        ...exampleSurvey,
        votingDeadline: Math.round(new Date().getTime() / 1000 + 10000),
      });

      await increaseTime(10000);

      await expect(votingFacet.vote(1, true)).to.be.rejectedWith(
        'VotingFacet: voting has ended'
      );
    });

    it('reverts when voter already voted', async () => {
      await votingFacet.connect(alice).vote(0, true);
      await expect(votingFacet.connect(alice).vote(0, true)).to.be.rejectedWith(
        'VotingFacet: already voted'
      );
    });

    it('reverts when voter has zero balance staked of required token', async () => {
      await expect(votingFacet.connect(mat).vote(0, true)).to.be.rejectedWith(
        'VotingFacet: must have staked token balance to vote'
      );
    });

    it('reverts when tokens are staked after the survey has begun', async () => {
      await stakingFacet
        .connect(alice)
        .deposit(await exampleToken.getAddress(), 1000);

      await expect(votingFacet.connect(alice).vote(0, true)).to.be.rejectedWith(
        'VotingFacet: must have staked before voting start to vote'
      );
    });

    it('successfully votes', async () => {
      await expect(votingFacet.connect(alice).vote(0, true))
        .to.emit(votingFacet, 'VoteCast')
        .withArgs(await alice.getAddress(), 0, true);
    });
  });

  describe('getSurvey', () => {
    const timeInNearFuture = Math.round(new Date().getTime() / 1000 + 1000);
    beforeEach(async () => {
      await votingFacet.createSurvey({
        ...exampleSurvey,
        votingStart: timeInNearFuture,
      });
      await increaseTime(1000);
      await votingFacet.connect(alice).vote(0, true);
    });

    it('returns proper survey data', async () => {
      const survey = await votingFacet.getSurvey(0);

      expect(survey.token).to.be.eq(await exampleToken.getAddress());
      expect(survey.name).to.be.eq(exampleSurvey.name);
      expect(survey.description).to.be.eq(exampleSurvey.description);
      expect(survey.votingStart).to.be.eq(timeInNearFuture);
      expect(survey.votingDeadline).to.be.eq(exampleSurvey.votingDeadline);
      expect(survey.yesVotes).to.be.eq(1);
      expect(survey.noVotes).to.be.eq(0);
      expect(survey.numberOfVotes).to.be.eq(1);
    });
  });
});
