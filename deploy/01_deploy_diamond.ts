import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { deployments, ethers } from 'hardhat';

const deployDiamond: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { diamond } = hre.deployments;

  const exampleTokenDeployment = (await deployments.get('ExampleToken'))
    .address;

  await diamond.deploy('VotingDiamond', {
    from: deployer,
    autoMine: true,
    log: true,
    waitConfirmations: 1,
    facets: ['InitFacet', 'StakingFacet', 'VotingFacet'],
    execute: {
      contract: 'InitFacet',
      methodName: 'init',
      args: [[exampleTokenDeployment]],
    },
  });
};
export default deployDiamond;
module.exports.tags = ['VotingDiamond'];
module.exports.dependencies = ['ExampleToken'];
