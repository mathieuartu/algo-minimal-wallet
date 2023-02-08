# 💳 AlgoMinimalWallet

![Unit tests](https://github.com/mathieuartu/algo-minimal-wallet/actions/workflows/unit-test.yml/badge.svg)
![Lint](https://github.com/mathieuartu/algo-minimal-wallet/actions/workflows/lint.yml/badge.svg)
![Build](https://github.com/mathieuartu/algo-minimal-wallet/actions/workflows/build.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/algo-minimal-wallet/latest.svg)](https://www.npmjs.com/package/algo-minimal-wallet/v/latest)
[![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/algo-minimal-wallet/latest.svg)](https://bundlephobia.com/result?p=algo-minimal-wallet@latest)

A simple class to programmaticaly interact with the Algorand blockchain

## Installation

```
npm i algo-minimal-wallet
```

## Usage

```typescript
import AlgoMinimalWallet from "algo-minimal-wallet"

const amw = new AlgoMinimalWallet({
	algodInfo: {
        server: 'ALGO_NODE_URL',
        port: 'ALGO_NODE_PORT',
        token: 'ALGO_NODE_TOKEN',
    }
	wallet: {
		address: 'YOUR_PUBLIC_ADDRESS',
		mnemonicPhrase: 'YOUR_MNEMONIC_PHRASE',
	},
})

(async () => {
    const balances = await amw.getBalances()
    // balances = { ALGO: 12.3, USDC: 140, ... }
	const { txId: algoSendTransactionId } = await amw.sendAlgo({ to: 'RECIPIENT_ADDRESS', amount: 10 })
	const { txId: asaSendTransactionId } = await amw.sendAsa({ to: 'RECIPIENT_ADDRESS', amount: 100, assetId: 3301 })
})()
```

MinimalAlgoWallet needs two things to work :

-   Public or private algod node credentials
-   Your public address and mnemonic phrase in order to sign the transactions
