import React, { useEffect, useRef } from 'react';
import { Payment } from '../types';

interface PaymentReceiptProps {
  payment: Payment;
  customTemplate?: string;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  payment, 
  customTemplate 
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (receiptRef.current && customTemplate) {
      receiptRef.current.innerHTML = customTemplate
        .replace('{{amount}}', payment.amount.toString())
        .replace('{{currency}}', payment.currency)
        .replace('{{status}}', payment.status);
    }
  }, [customTemplate, payment]);

  const renderPaymentDetails = () => {
    const detailsHtml = `
      <div class="payment-details">
        <p>Transaction ID: ${payment.id}</p>
        <p>Amount: ${payment.amount} ${payment.currency}</p>
        <p>Status: ${payment.status}</p>
      </div>
    `;
    
    return <div dangerouslySetInnerHTML={{ __html: detailsHtml }} />;
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head><title>Payment Receipt</title></head>
        <body>${receiptRef.current?.innerHTML || ''}</body>
      </html>
    `;
    document.write(printContent);
  };

  return (
    <div className="payment-receipt">
      <h2>Payment Receipt</h2>
      <div ref={receiptRef} className="receipt-content">
        {!customTemplate && renderPaymentDetails()}
      </div>
      <button onClick={handlePrint}>Print Receipt</button>
    </div>
  );
};
