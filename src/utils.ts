export function normalisedUuidCompare(uuid1: string, uuid2: string): boolean {
  const normaliseUuid = (str: string): string => str.replace(/-/g, '').toLowerCase();

  return normaliseUuid(uuid1) === normaliseUuid(uuid2);
}

export function normalisedMacCompare(mac1: string, mac2: string): boolean {
  const normaliseMac = (str: string): string => str.replace(/:/g, '').toLowerCase();

  return normaliseMac(mac1) === normaliseMac(mac2);
}

