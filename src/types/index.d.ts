export interface AlgoMinimalWalletOptionsWallet {
    address: string
    mnemonicPhrase: string
}
export interface AlgodInfo {
    token: string
    server: string
    port: string
}

export interface AlgoMinimalWalletOptions {
    algodInfo: AlgodInfo
    wallet: AlgoMinimalWalletOptionsWallet
}

export interface AccountInformationAsset {
    amount: number
    'asset-id': number
    'is-frozen': boolean
}

export interface GetAsaInfoResponse {
    id: 0
    unit_name: 'ALGO'
    fraction_decimals: 6
}

export interface GetBalancesResponse {
    [key: string]: number
}

export interface prepareTransactionOptions {
    to: string
    amount: number
    type: 'pay' | 'axfer' | 'app'
    note?: string
    assetIndex?: number
    appIndex?: number
    appArgs?: Uint8Array[]
    accounts?: string[]
    foreignAssets?: number[]
}

export interface sendAlgoOptions {
    to: string
    amount: number
    note?: string
}

export interface sendAsaOptions extends sendAlgoOptions {
    assetId: number
}
