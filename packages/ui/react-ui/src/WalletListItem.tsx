import { WalletReadyState } from '@solana/wallet-adapter-base';
import type { Wallet } from '@solana/wallet-adapter-react';
import type { FC, MouseEventHandler } from 'react';
import React from 'react';
import { Button } from './Button.js';
import { WalletIcon } from './WalletIcon.js';

export interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    wallet: Wallet;
    className?: string;
}

export const WalletListItem: FC<WalletListItemProps> = ({ handleClick, tabIndex, wallet, className }) => {
    return (
        <li>
            <Button
                onClick={handleClick}
                startIcon={<WalletIcon wallet={wallet} />}
                tabIndex={tabIndex}
                className={`wallet-adapter-button ${className || ''}`}
            >
                {wallet.adapter.name}
                {wallet.readyState === WalletReadyState.Installed && <span>Detected</span>}
            </Button>
        </li>
    );
};
