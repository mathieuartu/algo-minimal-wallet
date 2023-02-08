import algosdk from 'algosdk'
import axios from 'axios'
import {
    AccountInformationAsset,
    AlgoMinimalWalletOptions,
    AlgoMinimalWalletOptionsWallet,
    GetAsaInfoResponse,
    GetBalancesResponse,
    prepareTransactionOptions,
    sendAlgoOptions,
    sendAsaOptions,
} from './types'

/** Utility class used to check ALGO & ASA balances + send ALGO and ASA */
export default class AlgoMinimalWallet {
    private algodClient: algosdk.Algodv2
    private wallet: AlgoMinimalWalletOptionsWallet

    /**
     * Creates an AlgoMinimalWallet instance
     *
     * @param {AlgoMinimalWalletOptions} options
     * @param {import('./types').AlgodInfo} options.algodInfo
     * @param {string} options.algodInfo.token The token to authenticate with the algod server
     * @param {string} options.algodInfo.server The algod server url
     * @param {string} options.algodInfo.port The algod server port
     * @param {AlgoMinimalWalletOptionsWallet} options.wallet
     * @param {String} options.wallet.address The address of the wallet used to wrap/unwrap
     * @param {String} options.wallet.privateKey The private key of the wallet used to wrap/unwrap
     */
    constructor({ algodInfo, wallet }: AlgoMinimalWalletOptions) {
        this.algodClient = new algosdk.Algodv2(algodInfo.token, algodInfo.server, algodInfo.port)
        this.wallet = wallet
    }

    private signTransaction(transaction: algosdk.TransactionLike) {
        const userSecretKey = algosdk.mnemonicToSecretKey(this.wallet.mnemonicPhrase).sk
        return algosdk.signTransaction(transaction, userSecretKey)
    }

    private async prepareTransaction({
        amount,
        to,
        type,
        accounts,
        appArgs,
        appIndex,
        assetIndex,
        foreignAssets,
        note,
    }: prepareTransactionOptions): Promise<algosdk.TransactionLike> {
        let txn
        const suggestedParams = await this.algodClient.getTransactionParams().do()
        const txnParams = {
            from: this.wallet.address,
            to,
            amount,
            suggestedParams,
            note: new Uint8Array(Buffer.from(`${note}`, 'utf8')) || undefined,
        }

        if (type === 'pay') {
            txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(txnParams)
        } else if (type === 'axfer') {
            txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                ...txnParams,
                assetIndex: assetIndex || 0,
            })
        } else if (type === 'app') {
            txn = algosdk.makeApplicationNoOpTxnFromObject({
                ...txnParams,
                appArgs: appArgs || undefined,
                appIndex: appIndex || 0,
                accounts: accounts || undefined,
                foreignAssets: foreignAssets || [],
            })
        }

        return txn as algosdk.TransactionLike
    }

    private async getAsaInfo(asaId: number): Promise<GetAsaInfoResponse> {
        if (asaId === 0) {
            return {
                id: 0,
                unit_name: 'ALGO',
                fraction_decimals: 6,
            }
        } else {
            return (await axios.get(`https://mainnet.api.perawallet.app/v1/assets/${asaId}/`)).data
        }
    }

    /**
     * Gets the connected wallet assets balances
     *
     * @returns {Promise<GetBalancesResponse>} An object representing the ALGO & various ASA balances of the connected
     *   wallet
     */
    public async getBalances(): Promise<GetBalancesResponse> {
        const data = await this.algodClient.accountInformation(this.wallet.address).do()
        if (!data) return {}

        const balances = {} as { [key: string]: number }
        const algo = await this.getAsaInfo(0)
        const algoBalance = data.amount / Math.pow(10, algo.fraction_decimals)

        balances[algo.unit_name] = algoBalance

        await Promise.all(
            data.assets.map(async (asa: AccountInformationAsset) => {
                const asaInfo = await this.getAsaInfo(asa['asset-id'])
                return (balances[asaInfo.unit_name] = asa.amount / Math.pow(10, asaInfo.fraction_decimals))
            })
        )

        return balances
    }

    /**
     * Send ALGO to an address
     *
     * @param {sendAlgoOptions} options
     * @param {number} options.amount The amount of ALGO to send (in ALGO readable format)
     * @param {number} options.to The destination address
     * @param {number} options.note An optional utf-8 note to send with the transaction
     * @returns {Promise<{ txId: string }>} Hash of the transaction
     */
    public async sendAlgo({ amount, note = '', to }: sendAlgoOptions): Promise<{ txId: string }> {
        const algo = await this.getAsaInfo(0)
        const txn = await this.prepareTransaction({
            type: 'pay',
            to,
            amount: amount * Math.pow(10, algo.fraction_decimals),
            note,
        })
        const signedTransaction = this.signTransaction(txn)
        const sentTransaction = await this.algodClient.sendRawTransaction([signedTransaction.blob]).do()

        return sentTransaction
    }

    /**
     * Send ASA to an address
     *
     * @param {sendAsaOptions} options
     * @param {number} options.amount The amount of ASA to send (in the ASA readable format)
     * @param {number} options.assetId The id of the ASA we want to send
     * @param {number} options.to The destination address
     * @param {number} options.note An optional utf-8 note to send with the transaction
     * @returns {Promise<{ txId: string }>} Hash of the transaction
     */
    public async sendAsa({ amount, assetId, note = '', to }: sendAsaOptions): Promise<{ txId: string }> {
        const asa = await this.getAsaInfo(assetId)
        const txn = await this.prepareTransaction({
            type: 'axfer',
            to,
            amount: amount * Math.pow(10, asa.fraction_decimals),
            assetIndex: assetId,
            note,
        })
        const signedTransaction = this.signTransaction(txn)
        const sentTransaction = await this.algodClient.sendRawTransaction([signedTransaction.blob]).do()
        return sentTransaction
    }
}
