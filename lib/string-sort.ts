export const compareStrings = (a: string, b: string) => {
  // First, let's clean up the strings - remove spaces and convert to uppercase
  const cleanA = a.replace(/\s+/g, "").toUpperCase();
  const cleanB = b.replace(/\s+/g, "").toUpperCase();

  // Extract the numeric part from the beginning of each string
  const numA = parseInt(cleanA.match(/^\d+/)?.[0] || "0");
  const numB = parseInt(cleanB.match(/^\d+/)?.[0] || "0");

  // If numeric parts are different, sort by number
  if (numA !== numB) {
    return numA - numB;
  }

  // If numeric parts are the same, sort alphabetically
  return cleanA.localeCompare(cleanB);
};
