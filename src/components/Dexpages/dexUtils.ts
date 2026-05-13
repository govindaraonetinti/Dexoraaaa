
export const formatPrice = (p: any) => parseFloat(p || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatSize = (s: any) => parseFloat(s || 0).toFixed(4);