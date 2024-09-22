import { ed25519 } from '@noble/curves/ed25519';
import type { WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignInMessageSignerWalletAdapter,
    isVersionedTransaction,
    WalletNotConnectedError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { type SolanaSignInInput, type SolanaSignInOutput } from '@solana/wallet-standard-features';
import { createSignInMessage } from '@solana/wallet-standard-util';
import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

export const UnsafeBurnerWalletName = 'No wallet? Use a burner' as WalletName<'No wallet? Use a burner'>;

/**
 * This burner wallet adapter is unsafe to use and is only included to provide an easy way for applications to test
 * Wallet Adapter without using a third-party wallet.
 */
export class UnsafeBurnerWalletAdapter extends BaseSignInMessageSignerWalletAdapter {
    name = UnsafeBurnerWalletName;
    url = 'https://github.com/anza-xyz/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIHZpZXdCb3g9IjAgMCAxNi42MzA5IDIyLjkwMDQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTcuNjc1NzggMjEuMTIzQzEyLjgzMiAyMS4xMjMgMTYuMjY5NSAxNy42MzY3IDE2LjI2OTUgMTIuMzgyOEMxNi4yNjk1IDMuNjQyNTggOC44MjgxMiAwIDMuNjYyMTEgMEMyLjc0NDE0IDAgMi4xNTgyIDAuMzIyMjY2IDIuMTU4MiAwLjk0NzI2NkMyLjE1ODIgMS4xOTE0MSAyLjI2NTYyIDEuNDQ1MzEgMi40NzA3IDEuNjc5NjlDMy42MzI4MSAzLjA2NjQxIDQuNzk0OTIgNC43MTY4IDQuODE0NDUgNi42NDA2MkM0LjgxNDQ1IDcuMDgwMDggNC43NjU2MiA3LjQ3MDcgNC40NTMxMiA4LjAxNzU4TDQuOTQxNDEgNy45MTk5MkM0LjUwMTk1IDYuNDg0MzggMy4zMjAzMSA1LjQ2ODc1IDIuMjg1MTYgNS40Njg3NUMxLjg4NDc3IDUuNDY4NzUgMS42MTEzMyA1Ljc2MTcyIDEuNjExMzMgNi4yMDExN0MxLjYxMTMzIDYuNDU1MDggMS42Nzk2OSA3LjA1MDc4IDEuNjc5NjkgNy40ODA0N0MxLjY3OTY5IDkuNjY3OTcgMCAxMC45NDczIDAgMTQuNDcyN0MwIDE4LjQ2NjggMy4wNTY2NCAyMS4xMjMgNy42NzU3OCAyMS4xMjNaTTcuOTAwMzkgMTguMzc4OUM2LjA3NDIyIDE4LjM3ODkgNC44NjMyOCAxNy4yNzU0IDQuODYzMjggMTUuNjM0OEM0Ljg2MzI4IDEzLjkxNiA2LjA4Mzk4IDEzLjMwMDggNi4yNDAyMyAxMi4xOTczQzYuMjU5NzcgMTIuMTA5NCA2LjMxODM2IDEyLjA4MDEgNi4zODY3MiAxMi4xMzg3QzYuODM1OTQgMTIuNTM5MSA3LjEyODkxIDEzLjAyNzMgNy4zNzMwNSAxMy41OTM4QzcuODkwNjIgMTIuODkwNiA4LjEzNDc3IDExLjQwNjIgNy45Njg3NSA5LjgwNDY5QzcuOTU4OTggOS43MTY4IDguMDE3NTggOS42Njc5NyA4LjEwNTQ3IDkuNjk3MjdDMTAuMjQ0MSAxMC43MDMxIDExLjM1NzQgMTIuODMyIDExLjM1NzQgMTQuNzM2M0MxMS4zNTc0IDE2LjY2OTkgMTAuMjI0NiAxOC4zNzg5IDcuOTAwMzkgMTguMzc4OVoiIGZpbGw9IiNGRkFFNUEiIGZpbGwtb3BhY2l0eT0iMC44NSIvPjwvc3ZnPg==';
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    /**
     * Storing a keypair locally like this is not safe because any application using this adapter could retrieve the
     * secret key, and because the keypair will be lost any time the wallet is disconnected or the window is refreshed.
     */
    private _keypair: Keypair | null = null;

    constructor() {
        super();
        console.warn(
            'Your application is presently configured to use the `UnsafeBurnerWalletAdapter`. ' +
                'Find and remove it, then replace it with a list of adapters for ' +
                'wallets you would like your application to support. See ' +
                'https://github.com/anza-xyz/wallet-adapter#usage for an example.'
        );
    }

    get connecting() {
        return false;
    }

    get publicKey() {
        return this._keypair && this._keypair.publicKey;
    }

    get readyState() {
        return WalletReadyState.Loadable;
    }

    async connect(): Promise<void> {
        this._keypair = new Keypair();
        this.emit('connect', this._keypair.publicKey);
    }

    async disconnect(): Promise<void> {
        this._keypair = null;
        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        if (!this._keypair) throw new WalletNotConnectedError();

        if (isVersionedTransaction(transaction)) {
            transaction.sign([this._keypair]);
        } else {
            transaction.partialSign(this._keypair);
        }

        return transaction;
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        if (!this._keypair) throw new WalletNotConnectedError();

        return ed25519.sign(message, this._keypair.secretKey.slice(0, 32));
    }

    async signIn(input: SolanaSignInInput = {}): Promise<SolanaSignInOutput> {
        const { publicKey, secretKey } = (this._keypair ||= new Keypair());
        const domain = input.domain || window.location.host;
        const address = input.address || publicKey.toBase58();

        const signedMessage = createSignInMessage({
            ...input,
            domain,
            address,
        });
        const signature = ed25519.sign(signedMessage, secretKey.slice(0, 32));

        this.emit('connect', publicKey);

        return {
            account: {
                address,
                publicKey: publicKey.toBytes(),
                chains: [],
                features: [],
            },
            signedMessage,
            signature,
        };
    }
}
