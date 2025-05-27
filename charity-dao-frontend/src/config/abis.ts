// Contract ABIs for the Charity DAO
export const VOTING_GOVERNANCE_ABI = [
  // Vote on proposal
  {
    inputs: [
      { name: "_proposalId", type: "uint256" }
    ],
    name: "voteOnProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Execute proposal
  {
    inputs: [{ name: "_proposalId", type: "uint256" }],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Get single proposal
  {
    inputs: [{ name: "_proposalId", type: "uint256" }],
    name: "getProposalById",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "description", type: "string" },
          { name: "amountRequested", type: "uint256" },
          { name: "voteCount", type: "uint256" },
          { name: "approved", type: "bool" },
          { name: "executed", type: "bool" },
          { name: "recipient", type: "address" },
          { name: "creator", type: "address" },
          { name: "signatureCount", type: "uint256" },
          { name: "executionTime", type: "uint256" }
        ],
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Owner
  {
    inputs: [],
    name: "owner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function"
  }
]; 