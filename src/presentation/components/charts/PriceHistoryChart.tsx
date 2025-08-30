import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface PriceHistoryEntry {
  completeInBox: number;
  loose: number;
  new: number;
  captured: string;
}

interface PriceHistoryData {
  priceChartingId: number;
  name: string;
  lastUpdated: string;
  history: PriceHistoryEntry[];
}

interface PriceHistoryChartProps {
  data: PriceHistoryData[];
  className?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, className = '' }) => {
  // Transform the data for Recharts
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Check if any edition has history data
    const hasAnyHistory = data.some(edition => edition.history && edition.history.length > 0);
    if (!hasAnyHistory) return [];

    // Get all unique dates across all editions
    const allDates = new Set<string>();
    data.forEach(edition => {
      if (edition.history && edition.history.length > 0) {
        edition.history.forEach(entry => {
          allDates.add(entry.captured);
        });
      }
    });

    // Convert to sorted array
    const sortedDates = Array.from(allDates).sort();

    // Create chart data points
    return sortedDates.map(date => {
      const point: any = {
        date: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        fullDate: date
      };

      // Add data for each edition and condition
      data.forEach(edition => {
        if (edition.history && edition.history.length > 0) {
          const entry = edition.history.find(h => h.captured === date);
          if (entry) {
            const editionKey = edition.name.replace(/[^a-zA-Z0-9]/g, '_');
            point[`${editionKey}_completeInBox`] = entry.completeInBox;
            point[`${editionKey}_loose`] = entry.loose;
            point[`${editionKey}_new`] = entry.new;
          }
        }
      });

      return point;
    });
  }, [data]);

  // Generate line configurations
  const lineConfigs = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter out editions with no history data
    const editionsWithHistory = data.filter(edition => edition.history && edition.history.length > 0);
    if (editionsWithHistory.length === 0) return [];

    const colors = [
      { completeInBox: '#22d3ee', loose: '#facc15', new: '#10b981' }, // cyan, yellow, green
      { completeInBox: '#a855f7', loose: '#f97316', new: '#ef4444' }, // purple, orange, red
      { completeInBox: '#3b82f6', loose: '#8b5cf6', new: '#06b6d4' }, // blue, violet, sky
    ];

    return editionsWithHistory.flatMap((edition, editionIndex) => {
      const editionKey = edition.name.replace(/[^a-zA-Z0-9]/g, '_');
      const colorSet = colors[editionIndex % colors.length];
      const strokeWidth = editionIndex === 0 ? 2 : 2;
      const strokeDasharray = editionIndex === 0 ? undefined : editionIndex === 1 ? '5 5' : '3 3';

      return [
        {
          key: `${editionKey}_completeInBox`,
          name: `${edition.name} - Complete`,
          color: colorSet.completeInBox,
          strokeWidth,
          strokeDasharray
        },
        {
          key: `${editionKey}_loose`,
          name: `${edition.name} - Loose`,
          color: colorSet.loose,
          strokeWidth,
          strokeDasharray
        },
        {
          key: `${editionKey}_new`,
          name: `${edition.name} - New`,
          color: colorSet.new,
          strokeWidth,
          strokeDasharray
        }
      ];
    });
  }, [data]);

  const formatTooltip = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, name];
    }
    return [value, name];
  };

  const formatYAxis = (tickItem: number) => `$${tickItem}`;

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-400 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No pricing history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            formatter={formatTooltip}
            labelStyle={{ color: '#1f2937' }}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#f3f4f6'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9ca3af' }}
          />
          
          {lineConfigs.map((config) => (
            <Line
              key={config.key}
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={config.strokeWidth}
              strokeDasharray={config.strokeDasharray}
              name={config.name}
              connectNulls={false}
              dot={{ fill: config.color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: config.color, strokeWidth: 2, fill: '#1f2937' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};