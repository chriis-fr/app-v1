import PDFDocument from 'pdfkit';
import { Request } from 'express';

interface ProcurementRequestData {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedAmount: number;
  priority: string;
  urgency: string;
  department: string;
  justification: string;
  status?: string;
  expectedDeliveryDate?: string;
  preferredSupplier?: string;
  budgetCode?: string;
  specialRequirements?: string;
  alternativesConsidered?: string;
  impactOnOperations?: string;
  riskAssessment?: string;
  createdAt: string;
  requestor: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  organization: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export class PDFGenerator {
  static generateProcurementRequestPDF(data: ProcurementRequestData): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Header with Organization Details
    this.addHeader(doc, data.organization);
    
    // Title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('PROCUREMENT REQUEST FORM', { align: 'center' })
       .moveDown(0.5);

    // Request Details
    this.addRequestDetails(doc, data);
    
    // Item Details
    this.addItemDetails(doc, data);
    
    // Justification and Impact
    this.addJustificationSection(doc, data);
    
    // Additional Details
    this.addAdditionalDetails(doc, data);
    
    // Approval Section
    this.addApprovalSection(doc, data);
    
    // Footer
    this.addFooter(doc, data);

    doc.end();
    return Buffer.concat(chunks);
  }

  private static addHeader(doc: PDFKit.PDFDocument, organization: any) {
    // Organization Logo/Name
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(organization.name || 'ORGANIZATION NAME', { align: 'center' })
       .moveDown(0.5);

    // Organization Details
    doc.fontSize(10)
       .font('Helvetica')
       .text(organization.address || 'Address Line 1', { align: 'center' })
       .text(`${organization.phone || 'Phone'} | ${organization.email || 'Email'} | ${organization.website || 'Website'}`, { align: 'center' })
       .moveDown(1);

    // Separator line
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke()
       .moveDown(1);
  }

  private static addRequestDetails(doc: PDFKit.PDFDocument, data: ProcurementRequestData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('REQUEST DETAILS', { underline: true })
       .moveDown(0.5);

    const details = [
      { label: 'Request ID:', value: data.id },
      { label: 'Request Title:', value: data.title },
      { label: 'Description:', value: data.description },
      { label: 'Category:', value: data.category },
      { label: 'Department:', value: data.department },
      { label: 'Priority:', value: data.priority },
      { label: 'Urgency:', value: data.urgency },
      { label: 'Estimated Amount:', value: `$${data.estimatedAmount.toLocaleString()}` },
      { label: 'Expected Delivery:', value: data.expectedDeliveryDate || 'Not specified' },
      { label: 'Date Requested:', value: new Date(data.createdAt).toLocaleDateString() },
      { label: 'Requestor:', value: `${data.requestor.firstName} ${data.requestor.lastName}` },
      { label: 'Requestor Email:', value: data.requestor.email },
      { label: 'Requestor Department:', value: data.requestor.department }
    ];

    details.forEach(({ label, value }) => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(label, { continued: true })
         .font('Helvetica')
         .text(` ${value}`)
         .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  private static addItemDetails(doc: PDFKit.PDFDocument, data: ProcurementRequestData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('ITEM DETAILS', { underline: true })
       .moveDown(0.5);

    // Create a table-like structure
    const startY = doc.y;
    const colWidth = 120;
    const rowHeight = 20;

    // Headers
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Item', 50, startY)
       .text('Description', 170, startY)
       .text('Quantity', 320, startY)
       .text('Unit Price', 420, startY)
       .text('Total', 520, startY);

    // Draw table lines
    doc.moveTo(50, startY + 15)
       .lineTo(545, startY + 15)
       .stroke();

    // Sample item row (you can modify this based on actual items)
    doc.fontSize(10)
       .font('Helvetica')
       .text('Item 1', 50, startY + 25)
       .text(data.description.substring(0, 30) + '...', 170, startY + 25)
       .text('1', 320, startY + 25)
       .text(`$${data.estimatedAmount}`, 420, startY + 25)
       .text(`$${data.estimatedAmount}`, 520, startY + 25);

    doc.moveDown(2);
  }

  private static addJustificationSection(doc: PDFKit.PDFDocument, data: ProcurementRequestData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('JUSTIFICATION & IMPACT', { underline: true })
       .moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Business Justification:', { underline: true })
       .moveDown(0.3);

    doc.font('Helvetica')
       .text(data.justification, { width: 445 })
       .moveDown(0.5);

    if (data.impactOnOperations) {
      doc.font('Helvetica-Bold')
         .text('Impact on Operations:', { underline: true })
         .moveDown(0.3);

      doc.font('Helvetica')
         .text(data.impactOnOperations, { width: 445 })
         .moveDown(0.5);
    }

    doc.moveDown(1);
  }

  private static addAdditionalDetails(doc: PDFKit.PDFDocument, data: ProcurementRequestData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('ADDITIONAL DETAILS', { underline: true })
       .moveDown(0.5);

    const additionalDetails = [
      { label: 'Preferred Supplier:', value: data.preferredSupplier || 'None specified' },
      { label: 'Budget Code:', value: data.budgetCode || 'Not specified' },
      { label: 'Special Requirements:', value: data.specialRequirements || 'None' },
      { label: 'Alternatives Considered:', value: data.alternativesConsidered || 'None specified' },
      { label: 'Risk Assessment:', value: data.riskAssessment || 'None specified' }
    ];

    additionalDetails.forEach(({ label, value }) => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(label, { underline: true })
         .moveDown(0.3);

      doc.font('Helvetica')
         .text(value, { width: 445 })
         .moveDown(0.5);
    });

    doc.moveDown(1);
  }

  private static addApprovalSection(doc: PDFKit.PDFDocument, data: ProcurementRequestData) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('APPROVAL SECTION', { underline: true })
       .moveDown(1);

    const approvalY = doc.y;
    const signatureWidth = 150;
    const signatureHeight = 60;

    // Requestor Signature
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Requestor Signature:', 50, approvalY);

    // Signature box for requestor
    doc.rect(50, approvalY + 15, signatureWidth, signatureHeight)
       .stroke();

    doc.fontSize(8)
       .font('Helvetica')
       .text(`${data.requestor.firstName} ${data.requestor.lastName}`, 50, approvalY + 80)
       .text(data.requestor.email, 50, approvalY + 95)
       .text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 50, approvalY + 110);

    // Department Head Signature
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Department Head Signature:', 250, approvalY);

    // Signature box for department head
    doc.rect(250, approvalY + 15, signatureWidth, signatureHeight)
       .stroke();

    doc.fontSize(8)
       .font('Helvetica')
       .text('Department Head Name', 250, approvalY + 80)
       .text('Department Head Email', 250, approvalY + 95)
       .text('Date: _______________', 250, approvalY + 110);

    // Finance/Procurement Signature
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Finance/Procurement Signature:', 450, approvalY);

    // Signature box for finance
    doc.rect(450, approvalY + 15, signatureWidth, signatureHeight)
       .stroke();

    doc.fontSize(8)
       .font('Helvetica')
       .text('Finance Manager Name', 450, approvalY + 80)
       .text('Finance Manager Email', 450, approvalY + 95)
       .text('Date: _______________', 450, approvalY + 110);

    doc.moveDown(3);
  }

  private static addFooter(doc: PDFKit.PDFDocument, data: ProcurementRequestData) {
    const footerY = 750;

    // Separator line
    doc.moveTo(50, footerY)
       .lineTo(545, footerY)
       .stroke()
       .moveDown(0.5);

    doc.fontSize(8)
       .font('Helvetica')
       .text(`Document generated on ${new Date().toLocaleString()}`, { align: 'center' })
       .text(`Request ID: ${data.id} | Status: ${data.status || 'Pending'}`, { align: 'center' })
       .text('This document is automatically generated and contains all procurement request details.', { align: 'center' });
  }
} 