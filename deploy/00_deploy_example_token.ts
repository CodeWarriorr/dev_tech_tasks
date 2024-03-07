import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

export const deployExampleToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy('ExampleToken', {
    from: deployer,
    gasLimit: 4000000,
    args: [],
  });
};
export default deployExampleToken;
module.exports.tags = ['ExampleToken'];
