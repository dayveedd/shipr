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

export async function createMonnifySubAccount(
  bankCode: string,
  accountNumber: string,
  name: string
): Promise<string> {
  const token = await getMonnifyAccessToken();

  const payload = [
    {
      currencyCode: "NGN",
      bankCode,
      accountNumber,
      name: `ShipR Split: ${name.substring(0, 30)}`,
      email: "Shiprescrow@gmail.com",
      splitPercentage: 90.0,
    },
  ];

  const response = await fetch(`${baseUrl}/api/v1/sub-accounts`, {
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
      `Monnify SubAccount Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"} (Code: ${body.responseCode || "N/A"})`
    );
  }

  const subAccounts = body.responseBody || [];
  if (subAccounts.length === 0 || !subAccounts[0].subAccountCode) {
    throw new Error("No subAccountCode returned from Monnify");
  }

  return subAccounts[0].subAccountCode;
}

export interface MonnifyTransactionResponse {
  transactionReference: string;
  paymentReference: string;
  checkoutUrl: string;
}

export async function initializeMonnifyTransaction(
  amount: number,
  customerName: string,
  customerEmail: string,
  paymentReference: string,
  paymentDescription: string,
  redirectUrl: string,
  subAccountCode?: string
): Promise<MonnifyTransactionResponse> {
  const token = await getMonnifyAccessToken();

  const payload: any = {
    amount,
    customerName,
    customerEmail,
    paymentReference,
    paymentDescription,
    currencyCode: "NGN",
    contractCode,
    redirectUrl,
    paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
  };

  if (subAccountCode) {
    payload.incomeSplitConfig = [
      {
        subAccountCode,
        splitAmount: amount * 0.9,
        feePercentage: 0.0,
        feeBearer: true,
      },
    ];
  }

  const response = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
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
      `Monnify Transaction Init Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"} (Code: ${body.responseCode || "N/A"})`
    );
  }

  return {
    transactionReference: body.responseBody.transactionReference,
    paymentReference: body.responseBody.paymentReference,
    checkoutUrl: body.responseBody.checkoutUrl,
  };
}
