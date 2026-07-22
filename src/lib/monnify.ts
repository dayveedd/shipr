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

export interface MonnifyBank {
  name: string;
  code: string;
}

export async function getMonnifyBanks(): Promise<MonnifyBank[]> {
  const token = await getMonnifyAccessToken();
  const response = await fetch(`${baseUrl}/api/v1/banks`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const body = await response.json();
  if (!response.ok || !body.requestSuccessful) {
    throw new Error(
      `Monnify Banks Fetch Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"}`
    );
  }

  return (body.responseBody || []).map((b: any) => ({
    name: b.name,
    code: b.code,
  }));
}

export interface ValidatedAccount {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

export async function validateBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<ValidatedAccount> {
  const token = await getMonnifyAccessToken();
  const response = await fetch(
    `${baseUrl}/api/v2/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const body = await response.json();
  if (!response.ok || !body.requestSuccessful) {
    throw new Error(
      `Monnify Account Validation Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"}`
    );
  }

  return {
    accountName: body.responseBody.accountName,
    accountNumber: body.responseBody.accountNumber,
    bankCode: body.responseBody.bankCode,
  };
}

export interface DisbursementResponse {
  amount: number;
  reference: string;
  status: string;
}

export async function initiateDisbursementTransfer(
  amount: number,
  reference: string,
  bankCode: string,
  accountNumber: string,
  accountName: string
): Promise<DisbursementResponse> {
  const token = await getMonnifyAccessToken();
  const payload = {
    amount,
    reference,
    narration: "ShipR Payout Settlement",
    destinationBankCode: bankCode,
    destinationAccountNumber: accountNumber,
    destinationAccountName: accountName,
    currency: "NGN",
    async: false,
  };

  const response = await fetch(`${baseUrl}/api/v2/disbursements/single`, {
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
      `Monnify Disbursement Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"}`
    );
  }

  return {
    amount: body.responseBody.amount,
    reference: body.responseBody.reference,
    status: body.responseBody.status,
  };
}

export async function initiateBatchDisbursement(
  batchReference: string,
  title: string,
  narration: string,
  transactions: Array<{
    amount: number;
    reference: string;
    narration: string;
    destinationBankCode: string;
    destinationAccountNumber: string;
    destinationAccountName: string;
    currency: string;
  }>
): Promise<any> {
  const token = await getMonnifyAccessToken();
  const payload = {
    title,
    batchReference,
    narration,
    transactions,
  };

  const response = await fetch(`${baseUrl}/api/v2/disbursements/batch`, {
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
      `Monnify Batch Disbursement Error (HTTP status ${response.status}): ${body.responseMessage || "Failed"}`
    );
  }

  return body.responseBody;
}
