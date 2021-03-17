const normalise = (str: string): string => str.replace('-', '').toLowerCase();

export function normalisedCompare(uuid1: string, uuid2: string): boolean {
  return normalise(uuid1) === normalise(uuid2);
}

