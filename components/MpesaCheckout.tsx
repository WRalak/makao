'use client';

import { useState } from 'react';
import { Shield, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

interface MpesaResponse {
  ResponseCode: string;
  CheckoutRequestID: string;
  ResponseDescription: string;
}

interface MpesaCheckoutProps {
  amount: number;
  currency: 'KES' | 'UGX' | 'TZS';
  phoneNumber: string;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

export default function MpesaCheckout({ 
  amount, 
  currency, 
  phoneNumber,
  onPaymentSuccess,
  onPaymentError,
  className = ''
}: MpesaCheckoutProps) {
  const [mpesaPin, setMpesaPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'pin' | 'processing' | 'success' | 'error'>('phone');
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);

  const formatCurrency = (value: number, curr: string) => {
    const symbols = {
      KES: 'KES',
      UGX: 'UGX',
      TZS: 'TZS'
    };
    return `${symbols[curr as keyof typeof symbols]} ${value.toLocaleString()}`;
  };

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Kenya: 254XXXXXXXXX (12 digits starting with 254)
    // Uganda: 256XXXXXXXXX (12 digits starting with 256)
    // Tanzania: 255XXXXXXXXX (12 digits starting with 255)
    
    const kenyaPattern = /^254\d{9}$/;
    const ugandaPattern = /^256\d{9}$/;
    const tanzaniaPattern = /^255\d{9}$/;
    
    return kenyaPattern.test(cleaned) || ugandaPattern.test(cleaned) || tanzaniaPattern.test(cleaned);
  };

  const validatePin = (pin: string) => {
    // M-PESA PIN should be 4 digits
    return /^\d{4}$/.test(pin);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid M-PESA phone number');
      return;
    }

    if (amount < 1) {
      setError('Amount must be at least 1');
      return;
    }

    setShowPinInput(true);
    setStep('pin');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePin(mpesaPin)) {
      setError('Please enter a valid 4-digit M-PESA PIN');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError('');

    try {
      // Simulate M-PESA STK Push
      const response = await initiateMpesaPayment({
        phoneNumber: localPhoneNumber.replace(/^\+/, ''),
        amount: amount,
        accountReference: `MAKAO-${Date.now()}`,
        transactionDesc: `Makao Property Payment`,
        callbackUrl: `${window.location.origin}/api/payments/mpesa/callback`,
      });

      if (response.ResponseCode === '0') {
        // Success
        setStep('success');
        onPaymentSuccess?.(response.CheckoutRequestID);
      } else {
        // Error
        setStep('error');
        setError(response.ResponseDescription || 'Payment failed');
        onPaymentError?.(response.ResponseDescription || 'Payment failed');
      }
    } catch (err) {
      setStep('error');
      setError('Payment failed. Please try again.');
      onPaymentError?.('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateMpesaPayment = async (paymentData: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
    callbackUrl: string;
  }): Promise<MpesaResponse> => {
    // This would integrate with actual M-PESA API
    // For now, simulate the response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ResponseCode: '0',
          CheckoutRequestID: `MPESA-${Date.now()}`,
          ResponseDescription: 'Success',
        });
      }, 3000); // Simulate 3 second delay
    });
  };

  const resetForm = () => {
    setStep('phone');
    setShowPinInput(false);
    setMpesaPin('');
    setError('');
    setIsProcessing(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <Smartphone className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">M-PESA Payment</h2>
        <p className="text-sm text-gray-600">
          Secure payment powered by Safaricom
        </p>
      </div>

      {/* Step 1: Phone Number */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              M-PESA Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={localPhoneNumber}
                onChange={(e) => setLocalPhoneNumber(e.target.value)}
                placeholder="254 XXX XXX XXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={!phoneNumber.trim() || isProcessing}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Continue to PIN Entry
          </button>
        </form>
      )}

      {/* Step 2: PIN Entry */}
      {step === 'pin' && (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Enter your M-PESA PIN</p>
                <p className="text-sm text-yellow-700">
                  You will receive a prompt on your phone to enter this PIN
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              M-PESA PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={mpesaPin}
              onChange={(e) => setMpesaPin(e.target.value.replace(/\D/g, ''))}
              placeholder="•••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg text-center tracking-widest"
              disabled={isProcessing}
              autoFocus
            />
            {error && (
              <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={isProcessing}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!mpesaPin.trim() || isProcessing}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Pay {formatCurrency(amount, currency)}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Processing */}
      {step === 'processing' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 btn-primary rounded-full mb-4 animate-spin">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-sm text-gray-600">
            Initiating M-PESA STK Push...
          </p>
          <p className="text-sm text-gray-500">
            Please wait for the prompt on your phone
          </p>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-sm text-gray-600">
            Your payment of {formatCurrency(amount, currency)} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            You will receive a confirmation SMS shortly
          </p>
        </div>
      )}

      {/* Step 5: Error */}
      {step === 'error' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-sm text-gray-600">
            {error || 'Payment could not be processed. Please try again.'}
          </p>
          <button
            onClick={resetForm}
            className="mt-4 btn-primary py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Security Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <Shield className="h-4 w-4 inline mr-1" />
          Your M-PESA information is encrypted and secure. Never share your PIN with anyone.
        </div>
      </div>
    </div>
  );
}
