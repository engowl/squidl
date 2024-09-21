export function validateAlphanumeric(str) {
  const regex = /^[a-zA-Z0-9]+$/; // Regular expression for alphanumeric characters only
  return regex.test(str); // Returns true if valid, false otherwise
}

export const shortenAddress = (address, charsAtStart = 6, charsAtEnd = 4) => {
  if (!address) return "";

  // Shorten the address
  return `${address.substring(0, charsAtStart)}...${address.substring(
    address.length - charsAtEnd
  )}`;
};
