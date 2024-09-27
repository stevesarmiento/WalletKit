import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletName } from '@solana/wallet-adapter-wallets';
import type { FC, MouseEvent } from 'react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WalletListItem } from './WalletListItem.js';
import { WalletInfoContent } from './WalletInfoModal.js';
import { WalletSVG } from './WalletSVG.js';
import { useWalletModal } from './useWalletModal.js';
import { motion, AnimatePresence } from 'framer-motion';

export interface WalletModalProps {
    className?: string;
    container?: string;
}

export const WalletModal: FC<WalletModalProps> = ({ className = '', container = 'body' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [wrapperStyle, setWrapperStyle] = useState({});
    const { wallets, select } = useWallet();
    const { setVisible } = useWalletModal();
    const [fadeIn, setFadeIn] = useState(false);
    const [portal, setPortal] = useState<Element | null>(null);
    const [showInfo, setShowInfo] = useState(false);

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

    const handleInfoClick = useCallback(() => {
        setShowInfo((prevShowInfo) => !prevShowInfo);
    }, []);

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

    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.offsetHeight;
            const width = contentRef.current.offsetWidth;
            setWrapperStyle({ height: `${height}px`, width: `${width}px` });
        }
    }, [showInfo, allWallets.length]);

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
                    <div className="wallet-adapter-modal-wrapper" style={wrapperStyle}>
                        <button onClick={handleInfoClick} className="wallet-adapter-modal-button-info">
                            {showInfo ? (
                                <svg
                                    width="35"
                                    height="35"
                                    viewBox="0 0 12.3926 16.9629"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <g>
                                        <rect height="16.9629" opacity="0" width="12.3926" x="0" y="0"></rect>
                                        <path d="M0 8.47656C0 8.7207 0.0878906 8.93555 0.273438 9.12109L8.01758 16.6895C8.18359 16.8652 8.39844 16.9531 8.65234 16.9531C9.16016 16.9531 9.55078 16.5723 9.55078 16.0645C9.55078 15.8105 9.44336 15.5957 9.28711 15.4297L2.17773 8.47656L9.28711 1.52344C9.44336 1.35742 9.55078 1.13281 9.55078 0.888672C9.55078 0.380859 9.16016 0 8.65234 0C8.39844 0 8.18359 0.0878906 8.01758 0.253906L0.273438 7.83203C0.0878906 8.00781 0 8.23242 0 8.47656Z" />
                                    </g>
                                </svg>
                            ) : (
                                <svg
                                    width="35"
                                    height="35"
                                    viewBox="0 0 10.9766 18.7012"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <g>
                                        <rect height="18.7012" opacity="0" width="10.9766" x="0" y="0"></rect>
                                        <path d="M4.83398 13.3594C5.51758 13.3594 5.83008 12.8906 5.83008 12.2656C5.83008 12.1582 5.83008 12.041 5.83008 11.9336C5.84961 10.6445 6.30859 10.1074 7.87109 9.0332C9.55078 7.90039 10.6152 6.5918 10.6152 4.70703C10.6152 1.77734 8.23242 0.0976562 5.26367 0.0976562C3.05664 0.0976562 1.12305 1.14258 0.292969 3.02734C0.0878906 3.48633 0 3.93555 0 4.30664C0 4.86328 0.322266 5.25391 0.917969 5.25391C1.41602 5.25391 1.74805 4.96094 1.89453 4.48242C2.39258 2.62695 3.62305 1.92383 5.19531 1.92383C7.09961 1.92383 8.59375 2.99805 8.59375 4.69727C8.59375 6.09375 7.72461 6.875 6.47461 7.75391C4.94141 8.81836 3.81836 9.96094 3.81836 11.6797C3.81836 11.8848 3.81836 12.0898 3.81836 12.2949C3.81836 12.9199 4.16016 13.3594 4.83398 13.3594ZM4.83398 18.7012C5.61523 18.7012 6.23047 18.0762 6.23047 17.3145C6.23047 16.543 5.61523 15.9277 4.83398 15.9277C4.07227 15.9277 3.44727 16.543 3.44727 17.3145C3.44727 18.0762 4.07227 18.7012 4.83398 18.7012Z" />
                                    </g>
                                </svg>
                            )}
                        </button>
                        <button onClick={handleClose} className="wallet-adapter-modal-button-close">
                            <svg width="14" height="14">
                                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
                            </svg>
                        </button>
                        <div ref={contentRef} style={{ width: '100%' }}>
                            <AnimatePresence mode="popLayout">
                                {showInfo ? (
                                    <motion.div
                                        key="info"
                                        initial={{ opacity: 0, scale: 0.9, width: '100%' }}
                                        animate={{ opacity: 1, scale: 1, width: '100%' }}
                                        exit={{ opacity: 0, scale: 0.9, width: '100%' }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 20,
                                            mass: 1,
                                        }}
                                    >
                                        <WalletInfoContent />
                                    </motion.div>
                                ) : allWallets.length ? (
                                    <motion.div
                                        key="wallets"
                                        initial={{ opacity: 0, scale: 1.1, width: '100%' }}
                                        animate={{ opacity: 1, scale: 1, width: '100%' }}
                                        exit={{ opacity: 0, scale: 1.1, width: '100%' }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 20,
                                            mass: 1,
                                        }}
                                    >
                                        <h1 className="wallet-adapter-modal-title">Connect a wallet</h1>
                                        {allWallets.some(
                                            (wallet) => wallet.adapter.name !== UnsafeBurnerWalletName
                                        ) ? null : (
                                            <div className="wallet-adapter-modal-middle">
                                                <WalletSVG />
                                                <h1>No Wallets Detected</h1>
                                                <p>
                                                    You'll need add a wallet to your browser to interact with Solana if
                                                    you want to continue using this app.
                                                </p>
                                                {/* <button className="wallet-info-learn-more">Learn More</button> */}
                                                <div className="wallet-info-separator-container">
                                                    <div className="wallet-info-separator" />
                                                    <div className="wallet-info-navigation">
                                                        <span className="text-xs">Don't want to connect one?</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <ul className="wallet-adapter-modal-list">
                                            {allWallets.map((wallet) => (
                                                <WalletListItem
                                                    key={wallet.adapter.name}
                                                    handleClick={(event) =>
                                                        handleWalletClick(event, wallet.adapter.name)
                                                    }
                                                    wallet={wallet}
                                                    className={
                                                        wallet.adapter.name === UnsafeBurnerWalletName
                                                            ? 'wallet-adapter-modal-burner-wallet'
                                                            : ''
                                                    }
                                                />
                                            ))}
                                        </ul>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="no-wallets"
                                        initial={{ opacity: 0, scale: 1.2, width: '100%' }}
                                        animate={{ opacity: 1, scale: 1, width: '100%' }}
                                        exit={{ opacity: 0, scale: 1.2, width: '100%' }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 20,
                                            mass: 1,
                                        }}
                                    >
                                        <h1 className="wallet-adapter-modal-title">
                                            You'll need a wallet on Solana to continue
                                        </h1>
                                        <div className="wallet-adapter-modal-middle">
                                            <WalletSVG />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <div className="wallet-adapter-modal-overlay" onMouseDown={handleClose} />
            </div>,
            portal
        )
    );
};
