import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarcodeScanner, usePriceCharting } from './';
import { createPriceChartingApiService } from '../../infrastructure/api';
import { useAuthService } from './useAuthService';
import { logger } from '../../shared/utils/logger';

export interface UseBarcodeIntegrationReturn {
  lastBarcodeSearch: string | null;
  setLastBarcodeSearch: (barcode: string | null) => void;
  isProgrammaticUpdate: boolean;
  handleBarcodeScanned: (barcode: string) => Promise<void>;
  searchPriceChartingForBarcode: (barcode: string) => Promise<void>;
  barcodeScanner: {
    clearBuffer: () => void;
  };
}

/**
 * Custom hook to manage barcode scanner integration and PriceCharting fallback
 * Handles barcode scanning, search value updates, and PriceCharting API calls
 */
export function useBarcodeIntegration(
  setSearchValue: (value: string) => void,
  isSearchFieldFocused: boolean
): UseBarcodeIntegrationReturn {
  const navigate = useNavigate();
  const authService = useAuthService();
  const { isEnabled: isPriceChartingEnabled } = usePriceCharting();

  const [lastBarcodeSearch, setLastBarcodeSearch] = useState<string | null>(null);
  const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);

  // Barcode scanner integration
  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    logger.info('Complete barcode scanned, setting search value', { barcode }, 'USER');
    setIsProgrammaticUpdate(true);
    setSearchValue(barcode);
    setLastBarcodeSearch(barcode); // Track this as a barcode search
    // Reset the flag after a brief delay
    setTimeout(() => setIsProgrammaticUpdate(false), 100);
  }, [setSearchValue]);

  // Function to search PriceCharting when barcode not found in collection
  const searchPriceChartingForBarcode = useCallback(async (barcode: string) => {
    if (!isPriceChartingEnabled) {
      logger.info('PriceCharting integration disabled, skipping search', { barcode }, 'API');
      return;
    }

    try {
      logger.info('No games found in collection, searching PriceCharting for UPC', { barcode }, 'API');

      const priceChartingApiService = createPriceChartingApiService(authService);
      const results = await priceChartingApiService.searchPricing({ upc: barcode });

      if (results.length > 0) {
        const firstResult = results[0];
        logger.info('Found PriceCharting match', firstResult, 'API');

        // Navigate to Add Game with pre-populated data
        navigate('/add-game', {
          state: {
            autoPopulate: {
              name: firstResult.name,
              consoleName: firstResult.consoleName,
              upc: barcode,
              priceChartingId: firstResult.priceChartingId,
              pricing: {
                complete: firstResult.completeInBoxPrice,
                loose: firstResult.loosePrice,
                new: firstResult.newPrice
              }
            }
          }
        });
      } else {
        logger.info('No PriceCharting matches found for UPC', { barcode }, 'API');
        // Could show a notification here that no matches were found
      }
    } catch (error) {
      logger.error('Failed to search PriceCharting', error, 'API');
      // Could show error notification here
    }
  }, [authService, navigate, isPriceChartingEnabled]);

  const barcodeScanner = useBarcodeScanner({
    onBarcodeScanned: (barcode: string) => {
      // Wrap async function to avoid Promise warning
      void handleBarcodeScanned(barcode);
    },
    onScanningStarted: () => {
      logger.info('Barcode scanning started - clearing search field', undefined, 'USER');
      setIsProgrammaticUpdate(true);
      setSearchValue(''); // Clear existing search when new scan starts
      // Reset the flag after a brief delay
      setTimeout(() => setIsProgrammaticUpdate(false), 100);
    },
    onScanningEnded: () => {
      logger.info('Barcode scanning ended', undefined, 'USER');
    },
    enabled: !isProgrammaticUpdate && !isSearchFieldFocused, // Disable scanner during programmatic updates or when typing
    minLength: 8,  // Minimum barcode length
    maxLength: 30, // Maximum barcode length
    timeout: 100   // Timeout between keystrokes to detect scanner vs typing
  });

  return {
    lastBarcodeSearch,
    setLastBarcodeSearch,
    isProgrammaticUpdate,
    handleBarcodeScanned,
    searchPriceChartingForBarcode,
    barcodeScanner,
  };
}
