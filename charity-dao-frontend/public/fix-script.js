// Fix stakeholder status
localStorage.setItem('isStakeholder', 'true');
console.log('✅ Stakeholder status set to TRUE in localStorage');

// Check if we have a connected address, if not, set a dummy one
const connectedAddress = localStorage.getItem('connectedAddress');
if (!connectedAddress) {
  localStorage.setItem('connectedAddress', '0x0000000000000000000000000000000000000001');
  console.log('✅ Set a placeholder connected address');
}

// Force reload the page to apply changes
console.log('🔄 Reloading page to apply changes...');
setTimeout(() => {
  window.location.reload();
}, 1000); 