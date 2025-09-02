import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { GameAverages } from '../../../domain/models';

interface PriceChangeIndicatorProps {
  averages: GameAverages;
}

interface ChangeIndicatorProps {
  value: number;
  label: string;
}

const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({ value, label }) => {
  // Round to nearest percentage point (no decimal places)
  const roundedValue = Math.round(value);
  
  // Determine color and icon based on value
  const getColorAndIcon = () => {
    if (roundedValue > 0) {
      return {
        color: 'text-green-400',
        icon: <TrendingUp size={12} />
      };
    } else if (roundedValue < 0) {
      return {
        color: 'text-red-400',
        icon: <TrendingDown size={12} />
      };
    } else {
      return {
        color: 'text-gray-400',
        icon: <Minus size={12} />
      };
    }
  };

  const { color, icon } = getColorAndIcon();

  return (
    <div className="flex flex-col items-center text-xs">
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="font-medium">{Math.abs(roundedValue)}%</span>
      </div>
      <span className="text-gray-500 text-xs mt-0.5">{label}</span>
    </div>
  );
};

export const PriceChangeIndicator: React.FC<PriceChangeIndicatorProps> = ({ averages }) => {
  return (
    <div className="flex items-center gap-4">
      <ChangeIndicator 
        value={averages.completeInBoxDifference} 
        label="CIB" 
      />
      <ChangeIndicator 
        value={averages.looseDifference} 
        label="Loose" 
      />
      <ChangeIndicator 
        value={averages.newDifference} 
        label="New" 
      />
    </div>
  );
};