import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Quick Guide</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p className="mb-2">
            Charity DAO is a platform for transparent charitable donations. Connect your MetaMask wallet to participate.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">User Roles</h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium">Admin</h4>
              <p className="text-sm text-gray-600">
                Manages signers and executes approved proposals.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Signers</h4>
              <p className="text-sm text-gray-600">
                Approve proposals after voting. Two signatures required.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Stakeholders</h4>
              <p className="text-sm text-gray-600">
                Users who have donated. Can vote on proposals.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">How It Works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 pl-4">
            <li><strong>Create:</strong> Submit a proposal with description, amount, and recipient.</li>
            <li><strong>Vote:</strong> Stakeholders vote. Three votes needed to proceed.</li>
            <li><strong>Sign:</strong> Authorized signers approve proposals with enough votes.</li>
            <li><strong>Wait:</strong> 45-second time lock period after approval.</li>
            <li><strong>Execute:</strong> Admin transfers funds to recipient.</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">Connecting to MetaMask</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 pl-4">
            <li><strong>Install MetaMask:</strong> Download the MetaMask extension from <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">metamask.io</a> if you don't have it.</li>
            <li><strong>Create or Import Wallet:</strong> Set up a new wallet or import an existing one using your seed phrase.</li>
            <li><strong>Connect to the Platform:</strong> Click the "Connect Wallet" button in the top-right corner of the application.</li>
            <li><strong>Approve Connection:</strong> Confirm the connection request in the MetaMask popup.</li>
            <li><strong>Switch Network:</strong> Make sure you're connected to the correct network (Sepolia testnet).</li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">Key Features</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 pl-4">
            <li>Transparent voting and fund allocation</li>
            <li>Multi-signature security for all transactions</li>
            <li>On-chain record of all activities</li>
            <li>Time-locked execution for added security</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Help;
