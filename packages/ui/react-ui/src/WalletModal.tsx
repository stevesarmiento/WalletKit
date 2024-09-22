import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletName } from '@solana/wallet-adapter-wallets';
import type { FC, MouseEvent } from 'react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WalletListItem } from './WalletListItem.js';
import { WalletSVG } from './WalletSVG.js';
import { useWalletModal } from './useWalletModal.js';

export interface WalletModalProps {
    className?: string;
    container?: string;
}

export const WalletModal: FC<WalletModalProps> = ({ className = '', container = 'body' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { wallets, select } = useWallet();
    const { setVisible } = useWalletModal();
    const [fadeIn, setFadeIn] = useState(false);
    const [portal, setPortal] = useState<Element | null>(null);

    const allWallets = useMemo(() => {
        // Filter out unsupported wallets
        return wallets.filter((wallet) => wallet.readyState !== WalletReadyState.Unsupported);
    }, [wallets]);

    const hideModal = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, [setVisible]);

    const handleClose = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            hideModal();
        },
        [hideModal]
    );

    const handleWalletClick = useCallback(
        (event: MouseEvent, walletName: WalletName) => {
            select(walletName);
            handleClose(event);
        },
        [select, handleClose]
    );

    const handleTabKey = useCallback(
        (event: KeyboardEvent) => {
            const node = ref.current;
            if (!node) return;

            // here we query all focusable elements
            const focusableElements = node.querySelectorAll('button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                // if going backward by pressing tab and firstElement is active, shift focus to last focusable element
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    event.preventDefault();
                }
            } else {
                // if going forward by pressing tab and lastElement is active, shift focus to first focusable element
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    event.preventDefault();
                }
            }
        },
        [ref]
    );

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                hideModal();
            } else if (event.key === 'Tab') {
                handleTabKey(event);
            }
        };

        // Get original overflow
        const { overflow } = window.getComputedStyle(document.body);
        // Hack to enable fade in animation after mount
        setTimeout(() => setFadeIn(true), 0);
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Listen for keydown events
        window.addEventListener('keydown', handleKeyDown, false);

        return () => {
            // Re-enable scrolling when component unmounts
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [hideModal, handleTabKey]);

    useLayoutEffect(() => setPortal(document.querySelector(container)), [container]);

    return (
        portal &&
        createPortal(
            <div
                aria-labelledby="wallet-adapter-modal-title"
                aria-modal="true"
                className={`wallet-adapter-modal ${fadeIn && 'wallet-adapter-modal-fade-in'} ${className}`}
                ref={ref}
                role="dialog"
            >
                <div className="wallet-adapter-modal-container">
                    <div className="wallet-adapter-modal-wrapper">
                        <button className="wallet-adapter-modal-button-info">
                            <svg
                                width="35"
                                height="35"
                                viewBox="0 0 20.2832 19.9316"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M9.96094 19.9219C15.4102 19.9219 19.9219 15.4004 19.9219 9.96094C19.9219 4.51172 15.4004 0 9.95117 0C4.51172 0 0 4.51172 0 9.96094C0 15.4004 4.52148 19.9219 9.96094 19.9219ZM9.96094 18.2617C5.35156 18.2617 1.66992 14.5703 1.66992 9.96094C1.66992 5.35156 5.3418 1.66016 9.95117 1.66016C14.5605 1.66016 18.2617 5.35156 18.2617 9.96094C18.2617 14.5703 14.5703 18.2617 9.96094 18.2617Z" />
                                <path d="M9.75586 11.9824C10.2441 11.9824 10.5469 11.6699 10.5469 11.2891C10.5469 11.25 10.5469 11.2012 10.5469 11.1719C10.5469 10.625 10.8594 10.2734 11.543 9.82422C12.4902 9.19922 13.1641 8.63281 13.1641 7.46094C13.1641 5.83984 11.7188 4.96094 10.0586 4.96094C8.37891 4.96094 7.27539 5.76172 7.01172 6.66016C6.96289 6.81641 6.93359 6.97266 6.93359 7.13867C6.93359 7.57812 7.27539 7.8125 7.59766 7.8125C7.92969 7.8125 8.14453 7.65625 8.32031 7.42188L8.49609 7.1875C8.83789 6.62109 9.3457 6.28906 10 6.28906C10.8887 6.28906 11.4648 6.79688 11.4648 7.53906C11.4648 8.20312 11.0547 8.52539 10.2051 9.12109C9.50195 9.60938 8.97461 10.127 8.97461 11.084C8.97461 11.123 8.97461 11.1719 8.97461 11.2109C8.97461 11.7188 9.25781 11.9824 9.75586 11.9824ZM9.73633 14.8926C10.3027 14.8926 10.791 14.4434 10.791 13.877C10.791 13.3105 10.3125 12.8613 9.73633 12.8613C9.16016 12.8613 8.68164 13.3203 8.68164 13.877C8.68164 14.4336 9.16992 14.8926 9.73633 14.8926Z" />
                            </svg>
                        </button>
                        <button onClick={handleClose} className="wallet-adapter-modal-button-close">
                            <svg width="14" height="14">
                                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
                            </svg>
                        </button>
                        {allWallets.length ? (
                            <>
                                <h1 className="wallet-adapter-modal-title">Connect a wallet</h1>
                                <ul className="wallet-adapter-modal-list">
                                    {allWallets.map((wallet) => (
                                        <WalletListItem
                                            key={wallet.adapter.name}
                                            handleClick={(event) => handleWalletClick(event, wallet.adapter.name)}
                                            wallet={wallet}
                                            className={
                                                wallet.adapter.name === UnsafeBurnerWalletName
                                                    ? 'wallet-adapter-modal-burner-wallet'
                                                    : ''
                                            }
                                        />
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <h1 className="wallet-adapter-modal-title">
                                    You'll need a wallet on Solana to continue
                                </h1>
                                <div className="wallet-adapter-modal-middle">
                                    <WalletSVG />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="wallet-adapter-modal-overlay" onMouseDown={handleClose} />
            </div>,
            portal
        )
    );
};
