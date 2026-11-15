// Polygon Amoy rejects transactions whose priority fee is below 25 gwei, but
// MetaMask often suggests about 1.5 gwei for it. This raises the fee for
// Amoy transactions only (30 gwei tip, 60 gwei max), so nobody has to edit
// gas by hand. It does nothing on any other network.

const AMOY_CHAIN_ID = '0x13882';
const MIN_TIP = '0x6fc23ac00'; // 30 gwei
const MAX_FEE = '0xdf8475800'; // 60 gwei

try {
  const eth: any = (window as any).ethereum;

  if (eth && typeof eth.request === 'function' && !eth.__amoyGasPatched) {
    const originalRequest = eth.request.bind(eth);

    eth.request = async (args: any) => {
      try {
        if (
          args &&
          args.method === 'eth_sendTransaction' &&
          Array.isArray(args.params) &&
          args.params[0]
        ) {
          const chainId = await originalRequest({ method: 'eth_chainId' });
          if (chainId === AMOY_CHAIN_ID) {
            const tx = args.params[0];
            if (!tx.gasPrice) {
              tx.maxPriorityFeePerGas = MIN_TIP;
              tx.maxFeePerGas = MAX_FEE;
            }
          }
        }
      } catch (e) {
        console.warn('Amoy gas patch skipped:', e);
      }
      return originalRequest(args);
    };

    eth.__amoyGasPatched = true;
  }
} catch (e) {
  console.warn('Amoy gas patch could not be installed:', e);
}

export {};
