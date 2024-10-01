import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BaseWalletConnectionButton } from './BaseWalletConnectionButton.js';
import type { ButtonProps } from './Button.js';
import { useWalletModal } from './useWalletModal.js';

type Props = ButtonProps & {
    labels: Omit<
        { [TButtonState in ReturnType<typeof useWalletMultiButton>['buttonState']]: string },
        'connected' | 'disconnecting'
    > & {
        'copy-address': string;
        copied: string;
        'change-wallet': string;
        disconnect: string;
    };
};

const AnimatedText = ({ content }: { content: React.ReactNode }) => (
    <div key={typeof content === 'string' ? content : JSON.stringify(content)}>{content}</div>
);

export function BaseWalletMultiButton({ children, labels, ...props }: Props) {
    const { setVisible: setModalVisible } = useWalletModal();
    const { buttonState, onConnect, onDisconnect, publicKey, walletIcon, walletName } = useWalletMultiButton({
        onSelectWallet() {
            setModalVisible(true);
        },
    });
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const node = ref.current;

            // Do nothing if clicking dropdown or its descendants
            if (!node || node.contains(event.target as Node)) return;

            setMenuOpen(false);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, []);
    const handleCopy = async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 400);
        }
    };

    const ellipsifyAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const content = useMemo(() => {
        if (children) {
            return children;
        } else if (publicKey) {
            const base58 = publicKey.toBase58();
            return base58.slice(0, 4) + '..' + base58.slice(-4);
        } else if (buttonState === 'connecting' || buttonState === 'has-wallet') {
            return labels[buttonState];
        } else {
            return labels['no-wallet'];
        }
    }, [buttonState, children, labels, publicKey]);
    const SquareIcon = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 21.0254 20.4785"
            fill="none"
            stroke="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:scale-125 transition-all duration-150 ease-in-out fill-black/50 hover:fill-black"
        >
            <g>
                <rect height="20.4785" opacity="0" width="21.0254" x="0" y="0"></rect>
                <path
                    d="M15.9277 3.04688L15.9277 4.54102L14.3555 4.54102L14.3555 3.13477C14.3555 2.11914 13.8086 1.5918 12.8418 1.5918L3.08594 1.5918C2.10938 1.5918 1.57227 2.11914 1.57227 3.13477L1.57227 12.8418C1.57227 13.8574 2.10938 14.3848 3.08594 14.3848L4.73633 14.3848L4.73633 15.957L3.06641 15.957C1.01562 15.957 0 14.9414 0 12.9297L0 3.04688C0 1.03516 1.01562 0.0195312 3.06641 0.0195312L12.8711 0.0195312C14.9023 0.0195312 15.9277 1.03516 15.9277 3.04688Z"
                    fillOpacity="0.85"
                />
                <path
                    d="M7.80273 20.4785L17.6074 20.4785C19.6387 20.4785 20.6641 19.4629 20.6641 17.4512L20.6641 7.56836C20.6641 5.55664 19.6387 4.54102 17.6074 4.54102L7.80273 4.54102C5.75195 4.54102 4.73633 5.54688 4.73633 7.56836L4.73633 17.4512C4.73633 19.4629 5.75195 20.4785 7.80273 20.4785ZM7.82227 18.9062C6.85547 18.9062 6.30859 18.3789 6.30859 17.3633L6.30859 7.65625C6.30859 6.64062 6.85547 6.11328 7.82227 6.11328L17.5781 6.11328C18.5449 6.11328 19.0918 6.64062 19.0918 7.65625L19.0918 17.3633C19.0918 18.3789 18.5449 18.9062 17.5781 18.9062Z"
                    fillOpacity="0.85"
                />
            </g>
        </svg>
    );
    const DisconnectIcon = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 25.0254 20.4785"
            fill="none"
            stroke="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:scale-125 transition-all duration-150 ease-in-out fill-white"
        >
            <g>
                <rect height="20.9473" opacity="0" width="26.084" x="0" y="0"></rect>
                <path
                    d="M17.9492 3.06641L17.9492 7.80273L16.377 7.80273L16.377 3.0957C16.377 2.11914 15.8594 1.57227 14.8438 1.57227L4.63867 1.57227C3.62305 1.57227 3.0957 2.11914 3.0957 3.0957L3.0957 17.8516C3.0957 18.8281 3.62305 19.3652 4.63867 19.3652L14.8438 19.3652C15.8594 19.3652 16.377 18.8281 16.377 17.8516L16.377 13.1348L17.9492 13.1348L17.9492 17.8809C17.9492 19.9219 16.9434 20.9375 14.9219 20.9375L4.55078 20.9375C2.53906 20.9375 1.52344 19.9219 1.52344 17.8809L1.52344 3.06641C1.52344 1.03516 2.53906 0 4.55078 0L14.9219 0C16.9434 0 17.9492 1.03516 17.9492 3.06641Z"
                    fillOpacity="0.85"
                ></path>
                <path
                    d="M10.5664 11.2402L20.5957 11.2402L22.0508 11.1816L21.3672 11.8457L19.7852 13.3203C19.6289 13.457 19.5508 13.6621 19.5508 13.8477C19.5508 14.2578 19.8438 14.5605 20.2344 14.5605C20.4492 14.5605 20.6055 14.4824 20.752 14.3359L23.9355 11.0352C24.1309 10.8398 24.1992 10.6641 24.1992 10.4688C24.1992 10.2637 24.1309 10.0977 23.9355 9.90234L20.752 6.60156C20.6055 6.45508 20.4492 6.36719 20.2344 6.36719C19.8438 6.36719 19.5508 6.66016 19.5508 7.07031C19.5508 7.26562 19.6289 7.4707 19.7852 7.60742L21.3672 9.0918L22.0605 9.75586L20.5957 9.6875L10.5664 9.6875C10.1562 9.6875 9.80469 10.0488 9.80469 10.4688C9.80469 10.8887 10.1562 11.2402 10.5664 11.2402Z"
                    fillOpacity="0.85"
                ></path>
            </g>
        </svg>
    );

    const ChangeWalletIcon = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 26.5625 22.3535"
            fill="none"
            stroke="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="wallet-adapter-change-wallet-icon"
        >
            <g>
                <rect height="22.3535" opacity="0" width="26.5625" x="0" y="0"></rect>
                <path
                    d="M3.06641 9.76562L10.0293 9.76562C12.0703 9.76562 13.0957 8.75 13.0957 6.73828L13.0957 3.01758C13.0957 1.00586 12.0703 0 10.0293 0L3.06641 0C1.02539 0 0 1.00586 0 3.01758L0 6.73828C0 8.75 1.02539 9.76562 3.06641 9.76562ZM3.08594 8.19336C2.10938 8.19336 1.57227 7.66602 1.57227 6.65039L1.57227 3.10547C1.57227 2.08984 2.10938 1.57227 3.08594 1.57227L10.0098 1.57227C10.9766 1.57227 11.5234 2.08984 11.5234 3.10547L11.5234 6.65039C11.5234 7.66602 10.9766 8.19336 10.0098 8.19336ZM16.1621 22.3438L23.1348 22.3438C25.166 22.3438 26.2012 21.3281 26.2012 19.3164L26.2012 15.6055C26.2012 13.5938 25.166 12.5781 23.1348 12.5781L16.1621 12.5781C14.1309 12.5781 13.0957 13.584 13.0957 15.6055L13.0957 19.3164C13.0957 21.3379 14.1309 22.3438 16.1621 22.3438ZM16.1914 20.7715C15.2148 20.7715 14.668 20.2539 14.668 19.2383L14.668 15.6836C14.668 14.6777 15.2148 14.1504 16.1914 14.1504L23.1055 14.1504C24.0723 14.1504 24.6289 14.6777 24.6289 15.6836L24.6289 19.2383C24.6289 20.2539 24.0723 20.7715 23.1055 20.7715Z"
                    fillOpacity="0.85"
                />
                <path
                    d="M20.8887 10.752C21.1914 11.1719 21.5332 11.1621 21.8359 10.752L23.6523 8.28125C24.0527 7.74414 23.8965 7.19727 23.1738 7.19727L21.8848 7.19727L21.8848 6.99219C21.8848 4.18945 20 2.32422 17.207 2.32422L15.7422 2.32422C15.4102 2.32422 15.1367 2.60742 15.1367 2.93945C15.1367 3.27148 15.4102 3.54492 15.7422 3.54492L17.1973 3.54492C19.2773 3.54492 20.752 4.88281 20.752 7.00195L20.752 7.19727L19.5605 7.19727C18.8574 7.19727 18.6914 7.74414 19.0918 8.28125ZM8.98438 20.0195L10.4492 20.0195C10.7812 20.0195 11.0645 19.7363 11.0645 19.4043C11.0645 19.0723 10.7812 18.7988 10.4492 18.7988L8.99414 18.7988C6.91406 18.7988 5.43945 17.4512 5.43945 15.332L5.43945 15.1465L6.64062 15.1465C7.33398 15.1465 7.5 14.5996 7.10938 14.0527L5.30273 11.5918C5 11.1719 4.6582 11.1816 4.35547 11.5918L2.54883 14.0527C2.13867 14.5996 2.30469 15.1465 3.01758 15.1465L4.30664 15.1465L4.30664 15.3418C4.30664 18.1543 6.19141 20.0195 8.98438 20.0195Z"
                    fillOpacity="0.85"
                />
            </g>
        </svg>
    );
    return (
        <div className="wallet-adapter-dropdown">
            <BaseWalletConnectionButton
                {...props}
                aria-expanded={menuOpen}
                style={{ pointerEvents: menuOpen ? 'none' : 'auto', ...props.style }}
                onClick={() => {
                    switch (buttonState) {
                        case 'no-wallet':
                            setModalVisible(true);
                            break;
                        case 'has-wallet':
                            if (onConnect) {
                                onConnect();
                            }
                            break;
                        case 'connected':
                            setMenuOpen(true);
                            break;
                    }
                }}
                walletIcon={walletIcon}
                walletName={walletName}
            >
                <AnimatedText content={content} />
            </BaseWalletConnectionButton>
            <div
                aria-label="dropdown-list"
                className={`wallet-adapter-dropdown-list ${menuOpen && 'wallet-adapter-dropdown-list-active'}`}
                ref={ref}
                role="menu"
            >
                {publicKey ? (
                    <button className="wallet-adapter-dropdown-list-item" onClick={handleCopy} role="menuitem">
                        <div className="wallet-adapter-copy-button-icon">
                            <SquareIcon />
                        </div>
                        <span className="wallet-adapter-public-key">{ellipsifyAddress(publicKey.toBase58())}</span>
                    </button>
                ) : null}
                <button
                    className="wallet-adapter-dropdown-list-item"
                    onClick={() => {
                        setModalVisible(true);
                        setMenuOpen(false);
                    }}
                    role="menuitem"
                >
                    <ChangeWalletIcon />
                    <span className="wallet-adapter-dropdown-list-item-text">{labels['change-wallet']}</span>
                </button>
                {onDisconnect ? (
                    <button
                        className="wallet-adapter-dropdown-list-item"
                        onClick={() => {
                            onDisconnect();
                            setMenuOpen(false);
                        }}
                        role="menuitem"
                    >
                        <DisconnectIcon />
                        <span className="wallet-adapter-dropdown-list-item-text">{labels['disconnect']}</span>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
