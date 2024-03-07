import { deployments } from 'hardhat';
import { StakingFacet } from '../../typechain-types/contracts/StakingFacet';
import { VotingFacet } from '../../typechain-types/contracts/VotingFacet';
import { ExampleToken } from '../../typechain-types/contracts/ExampleToken';

export const setupFixture = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }, options) => {
    const {
      deployer: deployerAddress,
      alice: aliceAddress,
      bob: bobAddress,
      mat: matAddress,
    } = await getNamedAccounts();
    await deployments.fixture();

    const deployer = await ethers.getSigner(deployerAddress);
    const alice = await ethers.getSigner(aliceAddress);
    const bob = await ethers.getSigner(bobAddress);
    const mat = await ethers.getSigner(matAddress);

    const votingDiamondDeployment = await deployments.get('VotingDiamond');
    const votingDiamondAddress = votingDiamondDeployment.address;

    const stakingFacet = (await ethers.getContractAtWithSignerAddress(
      'StakingFacet',
      votingDiamondAddress,
      deployerAddress
    )) as StakingFacet;
    const votingFacet = (await ethers.getContractAtWithSignerAddress(
      'VotingFacet',
      votingDiamondAddress,
      deployerAddress
    )) as VotingFacet;

    const exampleToken = (await ethers.getContract(
      'ExampleToken'
    )) as ExampleToken;

    return {
      deployer,
      alice,
      bob,
      mat,
      stakingFacet,
      votingFacet,
      exampleToken,
    };
  }
);
