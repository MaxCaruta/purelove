import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Receipt data interface for PureLove subscriptions
export interface ReceiptData {
  orderId: string;
  date: string;
  subscriptionPlan: string;
  subscriptionDuration: string;
  originalPrice: number;
  finalPrice: number;
  paymentMethod: string;
  cryptoAsset?: string;
  cryptoAmount?: string;
  cryptoAddress?: string;
  email: string;
  transactionHash?: string;
  customerName?: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  coinsIncluded: number;
  features: string[];
  notes?: string;
}

// Company branding configuration
const COMPANY_CONFIG = {
  name: 'PureLove',
  tagline: 'Find Your Perfect Match',
  email: 'support@purelove.com',
  website: 'https://purelove.com',
  address: 'Dating Services Division',
  logo: null, // Can be set to base64 image string
  primaryColor: [244, 63, 94] as const, // RGB rose
  secondaryColor: [16, 185, 129] as const, // RGB green
  accentColor: [245, 158, 11] as const // RGB amber
};

// Receipt templates
export enum ReceiptTemplate {
  STANDARD = 'standard',
  DETAILED = 'detailed',
  MINIMAL = 'minimal',
  INVOICE = 'invoice'
}

// Receipt status types
export enum PaymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// Utility functions
const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PL-${timestamp}-${random}`;
};

// QR Code generation
const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return '';
  }
};

// Main receipt generation function
export const generateReceipt = async (
  data: ReceiptData,
  template: ReceiptTemplate = ReceiptTemplate.STANDARD,
  status: PaymentStatus = PaymentStatus.COMPLETED
): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Generate QR Code for transaction verification
    const qrCodeData = `Order ID: ${data.orderId}\nSubscription: ${data.subscriptionPlan}\nEmail: ${data.email}${data.transactionHash ? `\nTransaction Hash: ${data.transactionHash}` : ''}`;
    const qrCodeImage = await generateQRCode(qrCodeData);

    // Page setup
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let currentY = 20;

    // Header section
    currentY = await renderHeader(doc, pageWidth, margin, currentY, template);

    // Receipt title and status
    currentY = renderTitle(doc, pageWidth, currentY, status);

    // Order information section
    currentY = renderOrderInfo(doc, data, margin, pageWidth, currentY);

    // Subscription information section
    currentY = renderSubscriptionInfo(doc, data, margin, pageWidth, currentY);

    // Payment details section
    currentY = renderPaymentDetails(doc, data, margin, pageWidth, currentY, template);

    // Transaction details (if available)
    if (data.transactionHash) {
      currentY = renderTransactionDetails(doc, data, margin, pageWidth, currentY);
    }

    // Subscription features
    currentY = renderSubscriptionFeatures(doc, data, margin, pageWidth, currentY);

    // QR Code
    if (qrCodeImage) {
      renderQRCode(doc, qrCodeImage, pageWidth, pageHeight, margin);
    }

    // Footer
    renderFooter(doc, pageWidth, pageHeight, margin, status);

    // Watermark
    // renderWatermark(doc, pageWidth, pageHeight, status);

    // Generate filename and save
    const filename = `PureLove_Receipt_${data.orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    console.log(`Receipt generated successfully: ${filename}`);
  } catch (error) {
    console.error('Receipt generation failed:', error);
    throw new Error('Failed to generate receipt. Please try again.');
  }
};

// Header rendering
const renderHeader = async (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  startY: number,
  template: ReceiptTemplate
): Promise<number> => {
  let currentY = startY;

  // Company logo (if available)
  if (COMPANY_CONFIG.logo) {
    try {
      doc.addImage(COMPANY_CONFIG.logo, 'PNG', margin, currentY, 30, 15);
      currentY += 20;
    } catch (error) {
      console.warn('Logo could not be added to receipt');
    }
  }

  // Company information
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text(COMPANY_CONFIG.name, margin, currentY);
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(COMPANY_CONFIG.tagline, margin, currentY);
  
  currentY += 5;
  doc.text(COMPANY_CONFIG.email, margin, currentY);
  
  if (template === ReceiptTemplate.DETAILED || template === ReceiptTemplate.INVOICE) {
    currentY += 5;
    doc.text(COMPANY_CONFIG.website, margin, currentY);
    currentY += 5;
  }

  
  return currentY + 5;
};

// Title rendering
const renderTitle = (
  doc: jsPDF,
  pageWidth: number,
  startY: number,
  status: PaymentStatus
): number => {
  let currentY = startY;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  const titleText = status === PaymentStatus.COMPLETED ? 'SUBSCRIPTION RECEIPT' : 
                   status === PaymentStatus.PENDING ? 'PAYMENT PENDING' :
                   status === PaymentStatus.FAILED ? 'PAYMENT FAILED' : 'SUBSCRIPTION RECEIPT';
  
  doc.text(titleText, pageWidth / 2, currentY, { align: 'center' });

  // Status indicator
  if (status !== PaymentStatus.COMPLETED) {
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const statusColor = status === PaymentStatus.PENDING ? [245, 158, 11] as const :
                       status === PaymentStatus.FAILED ? [239, 68, 68] as const :
                       [16, 185, 129] as const;
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    const statusText = status === PaymentStatus.PENDING ? 'Payment confirmation pending' :
                      status === PaymentStatus.FAILED ? 'Payment processing failed' :
                      'Payment completed successfully';
    
    doc.text(statusText, pageWidth / 2, currentY, { align: 'center' });
  }

  return currentY + 10;
};

// Order information rendering
const renderOrderInfo = (
  doc: jsPDF,
  data: ReceiptData,
  margin: number,
  pageWidth: number,
  startY: number
): number => {
  let currentY = startY;

  const addDetailRow = (label: string, value: string, bold: boolean = false): void => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, currentY);
    
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;
  };

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text('ORDER INFORMATION', margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  addDetailRow('Order ID:', data.orderId, true);
  addDetailRow('Date:', formatDate(data.date));
  addDetailRow('Email:', data.email);

  if (data.customerName) {
    addDetailRow('Customer:', data.customerName);
  }

  // Horizontal line
  currentY += 3;
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  return currentY + 8;
};

// Subscription information rendering
const renderSubscriptionInfo = (
  doc: jsPDF,
  data: ReceiptData,
  margin: number,
  pageWidth: number,
  startY: number
): number => {
  let currentY = startY;

  const addDetailRow = (label: string, value: string): void => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;
  };

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text('SUBSCRIPTION DETAILS', margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  addDetailRow('Plan:', data.subscriptionPlan);
  addDetailRow('Duration:', data.subscriptionDuration);
  addDetailRow('Start Date:', formatDate(data.subscriptionStartDate));
  addDetailRow('End Date:', formatDate(data.subscriptionEndDate));
  addDetailRow('Coins Included:', data.coinsIncluded.toString());

  // Horizontal line
  currentY += 3;
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  return currentY + 8;
};

// Payment details rendering
const renderPaymentDetails = (
  doc: jsPDF,
  data: ReceiptData,
  margin: number,
  pageWidth: number,
  startY: number,
  template: ReceiptTemplate
): number => {
  let currentY = startY;

  const addDetailRow = (label: string, value: string, color?: readonly [number, number, number]): void => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    if (color) {
      doc.setTextColor(color[0], color[1], color[2]);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.text(value, pageWidth - margin, currentY, { align: 'right' });
    currentY += 6;
  };

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text('PAYMENT DETAILS', margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  
  addDetailRow('Payment Method:', data.paymentMethod);

  if (data.cryptoAsset) {
    addDetailRow('Crypto Asset:', data.cryptoAsset);
  }

  if (data.cryptoAmount) {
    addDetailRow('Crypto Amount:', data.cryptoAmount);
  }

  // Horizontal line before total
  currentY += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Total amount
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL AMOUNT:', margin, currentY);
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text(formatCurrency(data.finalPrice), pageWidth - margin, currentY, { align: 'right' });
  
  return currentY + 10;
};

// Subscription features rendering
const renderSubscriptionFeatures = (
  doc: jsPDF,
  data: ReceiptData,
  margin: number,
  pageWidth: number,
  startY: number
): number => {
  let currentY = startY;

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text('SUBSCRIPTION FEATURES', margin, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  data.features.forEach((feature) => {
    doc.text(`• ${feature}`, margin + 5, currentY);
    currentY += 5;
  });

  // Horizontal line
  currentY += 3;
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  return currentY + 8;
};

// Transaction details rendering
const renderTransactionDetails = (
  doc: jsPDF,
  data: ReceiptData,
  margin: number,
  pageWidth: number,
  startY: number
): number => {
  let currentY = startY;

  // Section header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COMPANY_CONFIG.primaryColor[0], COMPANY_CONFIG.primaryColor[1], COMPANY_CONFIG.primaryColor[2]);
  doc.text('TRANSACTION DETAILS', margin, currentY);
  currentY += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Transaction Hash:', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const hashLines = doc.splitTextToSize(data.transactionHash || '', pageWidth - (2 * margin));
  doc.text(hashLines, margin, currentY);
  currentY += hashLines.length * 4;

  if (data.cryptoAddress) {
    currentY += 3;
    doc.setTextColor(60, 60, 60);
    doc.text('Payment Address:', margin, currentY);
    currentY += 5;

    doc.setTextColor(0, 0, 0);
    const addressLines = doc.splitTextToSize(data.cryptoAddress, pageWidth - (2 * margin));
    doc.text(addressLines, margin, currentY);
    currentY += addressLines.length * 4;
  }

  return currentY + 8;
};

// QR Code rendering
const renderQRCode = (
  doc: jsPDF,
  qrCodeImage: string,
  pageWidth: number,
  pageHeight: number,
  margin: number
): void => {
  const qrSize = 25;
  const qrX = pageWidth - margin - qrSize;
  const qrY = pageHeight - margin - qrSize - 15;
  
  try {
    doc.addImage(qrCodeImage, 'PNG', qrX, qrY, qrSize, qrSize);
    
    // QR Code label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Scan for verification', qrX + (qrSize / 2), qrY + qrSize + 5, { align: 'center' });
  } catch (error) {
    console.warn('QR Code could not be added to receipt');
  }
};

// Footer rendering
const renderFooter = (
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  status: PaymentStatus
): void => {
  const footerY = pageHeight - 15;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`© ${new Date().getFullYear()} ${COMPANY_CONFIG.name}. All rights reserved.`, margin, footerY);
  
  const receiptText = status === PaymentStatus.COMPLETED ? 
    'This is an official receipt for your subscription.' :
    'This document serves as proof of your subscription request.';
  
  doc.text(receiptText, pageWidth - margin, footerY, { align: 'right' });

  // Support information
  doc.text(`For support: ${COMPANY_CONFIG.email}`, pageWidth / 2, footerY - 5, { align: 'center' });
};

// Watermark rendering
const renderWatermark = (
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  status: PaymentStatus
): void => {
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  
  const watermarkText = status === PaymentStatus.COMPLETED ? 'RECEIPT' :
                       status === PaymentStatus.PENDING ? 'PENDING' :
                       status === PaymentStatus.FAILED ? 'FAILED' : 'RECEIPT';
  
  doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { 
    align: 'center', 
    angle: -45
  });
};

// Utility functions for external use
export const createReceiptData = (
  orderId: string,
  subscriptionPlan: string,
  subscriptionDuration: string,
  email: string,
  finalPrice: number,
  paymentMethod: string,
  subscriptionStartDate: string,
  subscriptionEndDate: string,
  coinsIncluded: number,
  features: string[],
  options?: Partial<ReceiptData>
): ReceiptData => {
  return {
    orderId: orderId || generateOrderId(),
    date: new Date().toISOString(),
    subscriptionPlan,
    subscriptionDuration,
    originalPrice: options?.originalPrice || finalPrice,
    finalPrice,
    paymentMethod,
    email,
    subscriptionStartDate,
    subscriptionEndDate,
    coinsIncluded,
    features,
    ...options
  };
};

export const downloadReceipt = async (
  data: ReceiptData,
  template: ReceiptTemplate = ReceiptTemplate.STANDARD
): Promise<void> => {
  await generateReceipt(data, template, PaymentStatus.COMPLETED);
};

export const previewReceipt = async (
  data: ReceiptData,
  template: ReceiptTemplate = ReceiptTemplate.STANDARD
): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Generate a simplified preview
  doc.setFontSize(16);
  doc.text('Receipt Preview', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Order ID: ${data.orderId}`, 20, 40);
  doc.text(`Subscription: ${data.subscriptionPlan}`, 20, 50);
  doc.text(`Duration: ${data.subscriptionDuration}`, 20, 60);
  doc.text(`Total: ${formatCurrency(data.finalPrice)}`, 20, 70);

  return doc.output('datauristring');
};

// Export default function for backward compatibility
export default generateReceipt; 