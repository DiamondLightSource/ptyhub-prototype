import React, { useMemo } from 'react';
import { v4 as uuid4 } from 'uuid';
import { toast } from 'react-toastify';
import TextInputDropdown from '../TextInputDropdown/TextInputDropdown';

type Props = {
  scanNumbers: string[]
  setScanNumbers: (newScanNumbers: string[]) => void
  name: string
};

class InvalidScanNumberException extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

function ScanNumbersTextInputDropdown({
  scanNumbers, setScanNumbers, name,
}: Props) {
  const splitScanNumbers = (scanNumberString: string): string[] => {
    const splitScanNumbersSet = new Set<string>();
    const scanNumberRanges = scanNumberString.split(',');

    // eslint-disable-next-line no-restricted-syntax
    for (const scanNumberRange of scanNumberRanges) {
      const rangeBounds = scanNumberRange.split('-');

      // Showing nice error for negative scan numbers
      if (scanNumberRange.includes('-')) {
        if (rangeBounds.includes('')) {
          throw new InvalidScanNumberException(
            `Negative ${name.toLowerCase()}s are invalid. Issue caused with ${name.toLowerCase()} ${scanNumberRange}`,
          );
        }
      }

      if (rangeBounds.length === 1) {
        const scanNumber = parseInt(rangeBounds[0], 10);
        if (!Number.isNaN(scanNumber)) {
          splitScanNumbersSet.add(String(scanNumber));
        } else {
          throw new InvalidScanNumberException(`Invalid ${name.toLowerCase()} "${rangeBounds[0]}"`);
        }
      } else if (rangeBounds.length === 2) {
        const startScanNumber = parseInt(rangeBounds[0], 10);
        const endScanNumber = parseInt(rangeBounds[1], 10);
        if (Number.isNaN(startScanNumber)) {
          throw new InvalidScanNumberException(`Invalid ${name.toLowerCase()} "${rangeBounds[0]}"`);
        }

        if (Number.isNaN(endScanNumber)) {
          throw new InvalidScanNumberException(`Invalid ${name.toLowerCase()} "${rangeBounds[1]}"`);
        }

        if (startScanNumber > endScanNumber) {
          throw new InvalidScanNumberException(
            `${startScanNumber} is greater than ${endScanNumber} in your ${name.toLowerCase()} range`,
          );
        }

        for (let i = startScanNumber; i <= endScanNumber; i += 1) {
          splitScanNumbersSet.add(String(i));
        }
      } else {
        throw new InvalidScanNumberException(`${name} range "${scanNumberRange}" made up of more than 2 parts`);
      }
    }

    return Array.from(splitScanNumbersSet);
  };

  const handleScanNumberUpdate = (newValues: [string, string][]) => {
    // Splitting all of the separate scan number string inputs into one long list,
    // removing the duplicates
    let scanNumbersSplit: string[] = [];
    try {
      scanNumbersSplit = Array.from(
        newValues,
        ([, scanNumberString]) => splitScanNumbers(scanNumberString),
      ).flat();
    } catch (e) {
      // Only display invalid scan number exceptions in a toast
      if (e instanceof InvalidScanNumberException) {
        toast.error(`Error: ${e.message}`);
        return;
      }

      throw e;
    }

    const scanNumbersNoDuplicates = [...new Set(scanNumbersSplit)];
    setScanNumbers(scanNumbersNoDuplicates);
  };

  const sortedScanNumbers: [string, string][] = React.useMemo<[string, string][]>(() => {
    const integerScanNumbers: number[] = scanNumbers.map(
      (scanNumber) => parseInt(scanNumber, 10),
    );

    const sortedIntegerScanNumbers = integerScanNumbers.sort(
      (scanNumberA, scanNumberB) => scanNumberA - scanNumberB,
    );
    const formattedScanNumbers: [string, string][] = [];

    let rangeStart: number | null = null;
    let rangeEnd: number | null = null;

    // eslint-disable-next-line no-restricted-syntax
    for (const scanNumber of sortedIntegerScanNumbers) {
      if (rangeStart === null) {
        rangeStart = scanNumber;
        rangeEnd = scanNumber;
      } else if (rangeEnd !== null && scanNumber === rangeEnd + 1) {
        rangeEnd = scanNumber;
      } else {
        const formattedRange = rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`;
        formattedScanNumbers.push([uuid4(), formattedRange]);
        rangeStart = scanNumber;
        rangeEnd = scanNumber;
      }
    }

    if (rangeStart !== null) {
      const formattedRange = rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`;
      formattedScanNumbers.push([uuid4(), formattedRange]);
    }

    return formattedScanNumbers;
  }, [scanNumbers]);

  const placeholderText = useMemo<string>(() => {
    let placeholder = `${name}s`;
    if (sortedScanNumbers.length > 0) {
      placeholder += ': ';
      placeholder += sortedScanNumbers.map(([, scanNumber]) => scanNumber).join(', ');
    }

    return placeholder;
  }, [sortedScanNumbers]);

  return (
    <TextInputDropdown
      values={sortedScanNumbers}
      placeholderText={placeholderText}
      onUpdate={handleScanNumberUpdate}
    />
  );
}

export default ScanNumbersTextInputDropdown;
