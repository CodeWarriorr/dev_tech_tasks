import { ethers } from 'hardhat';

const wethMumbaiContract = '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa';
const walletAddresses = [
  '0x339D871eee01FABeEd6Ea3012842742d74f67977',
  '0xc7cDecB3048e41fc64A784905901dDf12366D711',
  '0x0e0E3d2C5c292161999474247956EF542caBF8dd',
  '0x0691Ca03EC63323DD1537B2fD2F27bA9D45920dB',
  '0x9883D5e7dC023A441A01Ef95aF406C69926a0AB6',
  '0xA09b25Fd2AA28B05B59ca35d263bD6a5e9d98577',
  '0xCd0d2b9E63dE359bFbD48C31A8D6Fb6FbeE505C0',
  '0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a', // Contract
  '0xC990d00F5B1774908e3c6b0fAeE5cCa572618E35',
  '0xBA6Fc8f42e7111a5807448e4aC9F77C55740df71',
  '0x3fA113276F3c7D861b61262D74461FFF582ecf02',
  '0xd3eDf9f180fAe44892f3D5A077BEC86Da74B2769',
  '0xB011D306D36c396847bA42b1c7AEb8E96C540d9a',
  '0x000000de5196C565325D3728E1Aa806A59FD177d',
  '0xF6C934507E2E8557D12E5179E0F4e3eF3a3428dE',
  '0xd33ad24fc780f4AE741405b91c06df1cD310edDa',
];
/**
 * This param limits the number of blocks to be fetched in a single request.
 * Public/Hosted nodes have limits on the number of blocks and/or logs that can be fetched in a single request.
 * For Alchemy node its 2k block range or 10k logs in a single request.
 * For large amount of addresses and/or large amount of transactions this param might need to be adjusted accordingly.
 */
const blockNumberIncrement = 1000000;

interface ITransactionHistory {
  blockNumber: number;
  from: string;
  to: string;
  value: string;
}

async function getPartialLogs(
  addresses: string[],
  fromBlock: number,
  toBlock: number
): Promise<ITransactionHistory[]> {
  const logsFrom = await ethers.provider.getLogs({
    address: wethMumbaiContract,
    fromBlock: fromBlock,
    toBlock: toBlock,
    topics: [ethers.id('Transfer(address,address,uint256)'), addresses, null],
  });

  const logsTo = await ethers.provider.getLogs({
    address: wethMumbaiContract,
    fromBlock: fromBlock,
    toBlock: toBlock,
    topics: [ethers.id('Transfer(address,address,uint256)'), null, addresses],
  });

  return logsFrom
    .concat(logsTo)
    .sort((a, b) => a.blockNumber - b.blockNumber || a.index - b.index)
    .map((log) => ({
      blockNumber: log.blockNumber,
      from: ethers.dataSlice(log.topics[1], 12),
      to: ethers.dataSlice(log.topics[2], 12),
      value: ethers.formatEther(log.data),
    }));
}

async function main() {
  const transactionHistory: ITransactionHistory[] = [];
  const latestBlock = await ethers.provider.getBlockNumber();

  const paddedAddresses = walletAddresses.map((address) =>
    ethers.zeroPadValue(address, 32)
  );

  for (let i = 0; i < latestBlock; i += blockNumberIncrement) {
    console.log('Parsing blocks from', i, ' to:', i + blockNumberIncrement);
    transactionHistory.push(
      ...(await getPartialLogs(paddedAddresses, i, i + blockNumberIncrement))
    );
  }

  console.table(transactionHistory);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
