export const generateReferralCode = () => {
  const prefix = "TEL";
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit
  return `${prefix}${randomDigits}`;
};

export const generateRandomTxResponse = () => {
  const randomPrefix = ["TX", "TXN", "TRX", "T-RX"];
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const randomString =
    randomPrefix[Math.floor(Math.random() * randomPrefix.length)];

  const txResponse = `${randomString}-${randomSuffix}-${Date.now()}`;

  if (!txResponse) {
    console.error("Generated txResponse is invalid:", txResponse);
    return "defaultTxResponse";
  }
  return txResponse;
};
