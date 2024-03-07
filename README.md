# Dev Test Project 

## Installation 

First we need to install the dependencies. 

```shell
npm install --force
```

Then we have to setup RPC url and mnemonic in .env file.
  
```shell
cp .env.example .env
```

## Running Tests

```shell
npx hardhat test
```

## Contracts Deployment 

```shell
npx hardhat deploy --network mumbai
```


# Task 1

## Preface
I've created a simple script that fetches the erc20 token transfers from alchemy hosted node and logs the data to the console.
Source of the data is mumbai testnet, the token is a WETH token and wallet addresses are semi-random, picked from WETH holders on polygonscan.

Fetching erc20 token transfers from public/hosted node is quite challanging. 
Such nodes have limits that makes it difficult to fetch all the data quickly.
Then We have to deal with limited topic filters that make retriving both from and to transfers at the same time impossible.


## Script Execution

With output to console

```shell
npx hardhat run ./scripts/erc20_transfers.ts --network mumbai 
```

With output to file

```shell
npx hardhat run ./scripts/erc20_transfers.ts --network mumbai >> output.txt
```

## Improvements
We can use self-hosted node with higher limits to fetch the data quickly.
We can use services like Alchemy API, Etherscan API, Moralis API etc. to fetch preindexed data quickly.
Output data could be saved to csv file or database for further analysis.
If this data would have to be fetched frequently, we could use event listeners to fetch the data in real time.
We can take it step further and use The Graph with its GraphQL API to fetch the data, especially if that data would be used regularly. 
Proper improvement should be picked based on the use case and specific requirements.

# Task 2

## Preface
This is somewhat very open task. I've decided to make it a little bit more interesting and use diamond standard as upgradable base for the contract(s). I'm a fun of diamond standard because I think its a great way to make contract(s) modular and upgrades cost-effective (depending on the use case).
I've made some assumptions and simplifications to make the task more manageable and time effective. 
For voting with the same assets from different wallets, I've assumed that lastDepositTime is reset when staking is done. This is crucial for preventing multi voting with the same asset but different wallets.
I've also assumed that voting is not proportional to the amount of staked tokens, but just one vote per wallet.
There are no function to get most of the data from the contract, but it could be easily added.
I've created simple tests just to speed up the development and check correctness of execution, those tests are by no means complete and for real application should be expanded.


## Execution

I think best execution of this task would be to run the tests.

## Improvements 
There are many improvements that could be made to this contract. 
A lot of improvements would be comming from the use case and specific requirements.
Some of the improvements that could be made are:
 - Add more getter functions to get more data from the contract
 - Add custom solidity errors instead of using require
 - Keep track of staked tokens data for analytics
 - Diamond upgradeability could be managed to support updates and possible initialization of new contract versions through some version check
 - More sophisticated voting system, for example proportional to the amount of staked tokens
 - Some minimal limits for the amount of staked tokens could be added


