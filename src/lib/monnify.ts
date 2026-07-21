const apiKey = process.env.MONNIFY_API_KEY;
const secretKey = process.env.MONNIFY_SECRET_KEY;
const baseUrl = process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com";
const contractCode = process.env.MONNIFY_CONTRACT_CODE || "";

export async function getMonnifyAccessToken(): Promise<string> {
  if (!apiKey || !secretKey) {
    throw new Error("Missing Monnify API Configuration variables: MONNIFY_API_KEY or MONNIFY_SECRET_KEY");
  }

  const tokenCredentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${tokenCredentials}`,
      "Content-Type": "application/json",
    },
  });

  const body = await response.json();

  if (!response.ok || !body.requestSuccessful) {
    throw new Error(
      `Monnify Auth Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"} (Code: ${body.responseCode || "N/A"})`
    );
  }

  return body.responseBody.accessToken;
}

export interface MonnifyAccount {
  bankName: string;
  accountNumber: string;
  bankCode: string;
}

export async function createReservedAccount(
  accountReference: string,
  accountName: string
): Promise<MonnifyAccount[]> {
  const token = await getMonnifyAccessToken();

  const bvn = process.env.MONNIFY_BVN || "";

  const payload = {
    accountReference,
    accountName,
    currencyCode: "NGN",
    contractCode,
    customerEmail: "Shiprescrow@gmail.com",
    customerName: "ShipR Escrow Pool",
    getAllAvailableBanks: false,
    preferredBanks: ["50515"],
    bvn,
  };

  const response = await fetch(`${baseUrl}/api/v2/bank-transfer/reserved-accounts`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok || !body.requestSuccessful) {
    throw new Error(
      `Monnify Reserved Account Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"} (Code: ${body.responseCode || "N/A"})`
    );
  }

  const accounts = body.responseBody.accounts || [];
  return accounts.map((acc: any) => ({
    bankName: acc.bankName,
    accountNumber: acc.accountNumber,
    bankCode: acc.bankCode,
  }));
}
