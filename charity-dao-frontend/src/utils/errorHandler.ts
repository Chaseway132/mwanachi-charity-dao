import { toast } from 'react-toastify';

// Define error types
export enum ErrorType {
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RPC_CIRCUIT_BREAKER = 'RPC_CIRCUIT_BREAKER',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Interface for standardized error handling
export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  context?: string;
}

/**
 * Centralized error handler for blockchain transactions
 * @param error The error object from the caught exception
 * @param options Configuration options for error handling
 * @returns An object with error type and message
 */
export const handleTransactionError = (
  error: any,
  options: ErrorHandlerOptions = { showToast: true, logToConsole: true }
): { type: ErrorType; message: string } => {
  const { showToast = true, logToConsole = true, context = 'Transaction' } = options;
  
  let errorType = ErrorType.UNKNOWN_ERROR;
  let errorMessage = 'An unknown error occurred';
  
  // Check for user rejection (MetaMask cancel)
  if (
    error.code === 'ACTION_REJECTED' || 
    (error.message && (
      error.message.includes('user rejected') || 
      error.message.includes('User denied') ||
      error.message.includes('User rejected')
    ))
  ) {
    errorType = ErrorType.USER_REJECTED;
    errorMessage = 'Transaction was cancelled in your wallet';
  }
  // Check for insufficient funds
  else if (
    error.code === 'INSUFFICIENT_FUNDS' || 
    (error.message && error.message.toLowerCase().includes('insufficient funds'))
  ) {
    errorType = ErrorType.INSUFFICIENT_FUNDS;
    errorMessage = 'Insufficient funds for transaction';
  }
  // Check for contract errors
  else if (error.code === 'CALL_EXCEPTION' || (error.message && error.message.includes('execution reverted'))) {
    errorType = ErrorType.CONTRACT_ERROR;
    
    // Extract the revert reason if available
    let reason = '';
    if (error.reason) {
      reason = error.reason;
    } else if (error.message) {
      const match = error.message.match(/execution reverted: (.*?)(?:"|$)/);
      if (match && match[1]) {
        reason = match[1];
      }
    }
    
    errorMessage = reason 
      ? `Contract error: ${reason}` 
      : 'Contract rejected the transaction';
  }
  // Check for RPC circuit breaker errors
  else if (
    error.message && (
      error.message.includes('circuit breaker') ||
      error.message.includes('isBrokenCircuitError') ||
      (error.code === -32603 && error.message && error.message.includes('Execution prevented'))
    )
  ) {
    errorType = ErrorType.RPC_CIRCUIT_BREAKER;
    errorMessage = 'RPC endpoint is temporarily unavailable. Please switch to a different RPC endpoint in MetaMask settings.';
  }
  // Check for network errors
  else if (
    error.message && (
      error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('timeout')
    )
  ) {
    errorType = ErrorType.NETWORK_ERROR;
    errorMessage = 'Network error. Please check your connection and try again';
  }
  // Use the error message if available
  else if (error.message) {
    errorMessage = error.message;
  }
  
  // Log to console if enabled
  if (logToConsole) {
    console.error(`${context} Error (${errorType}):`, error);
  }
  
  // Show toast notification if enabled
  if (showToast) {
    // Format the message based on error type
    let toastMessage = errorMessage;
    
    switch (errorType) {
      case ErrorType.USER_REJECTED:
        toastMessage = '🛑 Transaction cancelled';
        break;
      case ErrorType.INSUFFICIENT_FUNDS:
        toastMessage = '💰 Insufficient funds for this transaction';
        break;
      case ErrorType.CONTRACT_ERROR:
        // Keep the original message for contract errors
        break;
      case ErrorType.NETWORK_ERROR:
        toastMessage = '🌐 Network error. Please check your connection';
        break;
      case ErrorType.RPC_CIRCUIT_BREAKER:
        toastMessage = '⚠️ RPC endpoint overloaded. Switch to: https://rpc-amoy.polygon.technology/ in MetaMask settings';
        break;
      default:
        toastMessage = `❌ ${errorMessage}`;
    }
    
    toast.error(toastMessage);
  }
  
  return { type: errorType, message: errorMessage };
};

/**
 * Specialized error handler for proposal creation errors
 */
export const handleProposalCreationError = (error: any, options?: ErrorHandlerOptions) => {
  return handleTransactionError(error, { 
    ...options, 
    context: 'Proposal Creation' 
  });
};

/**
 * Specialized error handler for voting errors
 */
export const handleVotingError = (error: any, options?: ErrorHandlerOptions) => {
  return handleTransactionError(error, { 
    ...options, 
    context: 'Voting' 
  });
};

/**
 * Specialized error handler for signing errors
 */
export const handleSigningError = (error: any, options?: ErrorHandlerOptions) => {
  return handleTransactionError(error, { 
    ...options, 
    context: 'Signing' 
  });
};

/**
 * Specialized error handler for execution errors
 */
export const handleExecutionError = (error: any, options?: ErrorHandlerOptions) => {
  return handleTransactionError(error, { 
    ...options, 
    context: 'Execution' 
  });
};

/**
 * Specialized error handler for donation errors
 */
export const handleDonationError = (error: any, options?: ErrorHandlerOptions) => {
  return handleTransactionError(error, { 
    ...options, 
    context: 'Donation' 
  });
};
