import { useEffect, useRef } from 'react';

interface BarcodeScannerOptions {
  onBarcodeScanned: (barcode: string) => void;
  onScanningStarted?: () => void;
  onScanningEnded?: () => void;
  minLength?: number;
  maxLength?: number;
  timeout?: number;
  enabled?: boolean;
}

/**
 * Custom hook to detect barcode scanner input
 * 
 * Barcode scanners typically:
 * - Send characters rapidly (faster than human typing)
 * - End with an Enter key press
 * - Send a continuous string without pauses
 * 
 * This hook detects these patterns and calls the callback when a barcode is detected.
 */
export const useBarcodeScanner = ({
  onBarcodeScanned,
  onScanningStarted,
  onScanningEnded,
  minLength = 8,
  maxLength = 30,
  timeout = 100,
  enabled = true
}: BarcodeScannerOptions) => {
  const inputBuffer = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInputTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field (unless it's our search field)
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      const isSearchField = target.getAttribute('aria-label') === 'Search game collection' || 
                           target.placeholder?.includes('Search your collection');
      
      // Only intercept if not in an input field, or if in our specific search field
      if (isInputField && !isSearchField) return;

      const currentTime = Date.now();
      const timeSinceLastInput = currentTime - lastInputTime.current;
      
      // If Enter key is pressed, process the buffer
      if (event.key === 'Enter') {
        event.preventDefault();
        
        const barcode = inputBuffer.current.trim();
        if (barcode.length >= minLength && barcode.length <= maxLength) {
          console.log('📱 Complete barcode detected:', barcode);
          onBarcodeScanned(barcode);
        } else {
          console.log('📱 Barcode rejected - length:', barcode.length, 'content:', barcode);
        }
        
        // Clear the buffer and end scanning
        inputBuffer.current = '';
        onScanningEnded?.();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      // Ignore special keys (except printable characters)
      if (event.key.length > 1 && !['Backspace', 'Delete'].includes(event.key)) {
        return;
      }

      // If too much time has passed, this is likely human typing - clear buffer
      if (timeSinceLastInput > timeout && inputBuffer.current.length > 0) {
        inputBuffer.current = '';
      }

      // Handle printable characters
      if (event.key.length === 1) {
        // If this is the first character and we detect rapid input, start scanning mode
        if (inputBuffer.current.length === 0 && timeSinceLastInput < timeout * 2) {
          onScanningStarted?.();
        }
        
        // During barcode scanning, prevent ALL characters from appearing in input fields
        // This ensures the search field doesn't get updated character by character
        if (inputBuffer.current.length > 0 || timeSinceLastInput < timeout) {
          event.preventDefault();
        }
        
        inputBuffer.current += event.key;
        lastInputTime.current = currentTime;
        console.log('📱 Buffer building:', inputBuffer.current, 'length:', inputBuffer.current.length);

        // Clear buffer after timeout if no more input
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          // If buffer is not empty after timeout and no Enter was pressed, 
          // this was likely human typing - clear it
          if (inputBuffer.current.length > 0) {
            console.log('📱 Timeout reached, clearing buffer:', inputBuffer.current);
            inputBuffer.current = '';
            onScanningEnded?.();
          }
        }, timeout * 3); // Give more time before clearing
      }

      // Handle backspace/delete
      if (event.key === 'Backspace' || event.key === 'Delete') {
        // This is likely human typing, clear the barcode buffer
        inputBuffer.current = '';
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    // Add event listener to document to capture all keyboard events
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onBarcodeScanned, minLength, maxLength, timeout, enabled]);

  // Function to manually clear the buffer (useful for testing)
  const clearBuffer = () => {
    inputBuffer.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return {
    clearBuffer
  };
};