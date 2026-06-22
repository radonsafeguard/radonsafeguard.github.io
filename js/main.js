document.addEventListener('DOMContentLoaded', () => {
  // Full accurate main.js from local
  if (localStorage.getItem('radonLoggedIn') === 'true' && 
      !window.location.pathname.includes('customers.html') && 
      !window.location.pathname.includes('estimates.html') &&
      !window.location.pathname.includes('invoices.html') &&
      !window.location.pathname.includes('reports.html')) {
    window.location.href = 'customers.html';
    return;
  }
  // ... rest of the JS
});