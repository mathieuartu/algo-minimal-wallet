import AlgoMinimalWallet from '../index'

const arbitraryWallet = {
    address: '4N2DB7ZFERQZD6FPZ4TGYHYBG4WOS3SQCWFJO25LBQFMA7TMSLUPUBYNJI',
    mnemonicPhrase:
        'hollow sustain tumble staff antenna victory eyebrow stuff duty neck toy first beef december myth shoulder syrup wheel credit copper mango employ maximum absent input',
}

const emptyConfig = {
    algodInfo: {
        server: '',
        port: '',
        token: '',
    },
    wallet: {
        address: '',
        mnemonicPhrase: '',
    },
}

const correctConfig = {
    algodInfo: {
        server: 'https://node.algoexplorerapi.io/',
        port: '',
        token: '',
    },
    wallet: arbitraryWallet,
}

describe('AlgoMinimalWallet', () => {
    describe('constructor', () => {
        it('Should throw an error when the arguments are empty', () => {
            expect(() => new AlgoMinimalWallet(emptyConfig)).toThrow()
        })
        it('Should not throw an error when the arguments are correct', () => {
            expect(() => new AlgoMinimalWallet(correctConfig)).not.toThrow()
        })

        it('Should throw an error when the arguments are not in the expected format', async () => {
            const amw = new AlgoMinimalWallet({
                ...correctConfig,
                wallet: {
                    ...arbitraryWallet,
                    address: 'qsd',
                    mnemonicPhrase: 'nothing',
                },
            })
            await expect(amw.getBalances()).rejects.toThrow()
        })
    })

    const amw = new AlgoMinimalWallet(correctConfig)

    describe('getBalances', () => {
        it('should give the correct ALGO balance', async () => {
            await expect(amw.getBalances()).resolves.toEqual({ ALGO: 0 })
        })
        it('should give the correct ASA balance', async () => {
            const balances = await amw.getBalances()
            expect(balances['USDC']).toBeUndefined()
        })
    })

    describe('sendAlgo', () => {
        it('should throw when having insufficient balance', async () => {
            await expect(amw.sendAlgo({ to: arbitraryWallet.address, amount: 1 })).rejects.toThrow()
        })
    })

    describe('sendAsa', () => {
        it('should throw when having insufficient balance', async () => {
            await expect(amw.sendAsa({ to: arbitraryWallet.address, amount: 1, assetId: 300 })).rejects.toThrow()
        })
    })
})
