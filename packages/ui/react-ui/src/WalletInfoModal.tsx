import React, { useState } from 'react';
import { WalletIllustration } from './WalletIllustration.js';

const steps = [
    {
        title: 'What is a Wallet?',
        content:
            'Wallets let you store, receive, send, and interact with digital assets like NFTs and tokens on Solana.',
    },
    {
        title: 'More Secure, Easier to Use.',
        content:
            'With blockchain apps, your wallet is used as a secure and easy way to login and interact with web applications.',
    },
    {
        title: 'Wallets are Permissionless.',
        content:
            'An essential utility for permissionless blockchain apps. Wallets let you explore and participate in the new web.',
    },
];

export const WalletInfoContent: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    return (
        <div className="wallet-adapter-modal-info-content">
            <h1 className="wallet-adapter-modal-info-title">About Wallets</h1>

            <WalletIllustration
                className="wallet-info-illustration"
                circleColors={['#123456', '#789ABC', '#DEF012', '#345678']}
                currentStep={currentStep}
            />
            <div className="wallet-info-slider">
                {steps.map((step, index) => (
                    <div key={index} className={`wallet-info-step ${index === currentStep ? 'active' : ''}`}>
                        <h2 className="wallet-info-step-title">{step.title}</h2>
                        <p className="wallet-info-step-content">{step.content}</p>
                    </div>
                ))}
            </div>
            <div className="wallet-info-navigation-container">
                <div className="wallet-info-separator" />
                <div className="wallet-info-navigation">
                    {steps.map((_, index) => (
                        <button
                            key={index}
                            className={`step-indicator ${index === currentStep ? 'active' : ''}`}
                            onClick={() => goToStep(index)}
                            aria-label={`Go to step ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <button className="wallet-info-learn-more">Learn More</button>
        </div>
    );
};
