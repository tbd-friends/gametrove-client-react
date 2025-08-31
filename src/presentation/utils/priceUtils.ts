/**
 * Formats a percentage change value for display
 * @param percentage The percentage change (can be positive or negative)
 * @returns An object containing the formatted display string and CSS classes for styling
 */
export function formatPercentageChange(percentage: number): {
    displayText: string;
    colorClass: string;
    isPositive: boolean;
    isZero: boolean;
} {
    const isPositive = percentage > 0;
    const isZero = percentage === 0;
    const absPercentage = Math.abs(percentage);
    
    // Format to 2 decimal places
    const formattedValue = absPercentage.toFixed(2);
    
    // Add appropriate sign
    const sign = isZero ? '' : isPositive ? '+' : '-';
    const displayText = `${sign}${formattedValue}%`;
    
    // Determine color class
    let colorClass: string;
    if (isZero) {
        colorClass = 'text-gray-400';
    } else if (isPositive) {
        colorClass = 'text-green-400';
    } else {
        colorClass = 'text-red-400';
    }
    
    return {
        displayText,
        colorClass,
        isPositive,
        isZero
    };
}