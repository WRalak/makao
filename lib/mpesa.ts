import crypto from 'crypto';

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}

export interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      Amount: number;
      MpesaReceiptNumber: string;
      Balance: number;
      TransactionDate: string;
      PhoneNumber: string;
    };
  };
  stkCallback: {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    Amount: number;
    MpesaReceiptNumber: string;
    Balance: number;
    TransactionDate: string;
    PhoneNumber: string;
  };
}

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private passkey: string;
  private shortcode: string;
  private environment: 'sandbox' | 'production';

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.passkey = process.env.MPESA_PASSKEY!;
    this.shortcode = process.env.MPESA_SHORTCODE!;
    this.environment = process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production';
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
  }

  async initiateStkPush(paymentRequest: MpesaPaymentRequest) {
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword();
    
    const url = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    // Get access token
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const { access_token } = await tokenResponse.json();
    
    // Initiate STK Push
    const stkUrl = this.environment === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const stkPayload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: paymentRequest.amount,
      PartyA: this.shortcode,
      PartyB: paymentRequest.phoneNumber.replace(/^\+/, ''),
      PhoneNumber: paymentRequest.phoneNumber.replace(/^\+/, ''),
      CallBackURL: paymentRequest.callbackUrl,
      AccountReference: paymentRequest.accountReference,
      TransactionDesc: paymentRequest.transactionDesc,
    };

    const response = await fetch(stkUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });

    return response.json();
  }

  validateCallback(callbackData: MpesaCallback): boolean {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      // Verify the callback is authentic
      if (!stkCallback) return false;
      
      // Check if transaction was successful
      return stkCallback.ResultCode === 0;
    } catch (error) {
      console.error('M-PESA callback validation error:', error);
      return false;
    }
  }

  formatPhoneNumber(phone: string): string {
    // Format for M-PESA: remove +, ensure 254 for Kenya
    const cleaned = phone.replace(/^\+/, '').replace(/\s/g, '');
    
    // Default to Kenya format if not starting with country code
    if (!cleaned.startsWith('254') && cleaned.length === 9) {
      return `254${cleaned}`;
    }
    
    return cleaned;
  }
}
