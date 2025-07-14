import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Request } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  static generateProcurementRequestPDF(data: ProcurementRequestData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        autoFirstPage: true
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', (error) => {
        reject(error);
      });

      // Modern color palette
      const primaryColor = '#1e40af'; // Deep blue
      const secondaryColor = '#64748b'; // Slate gray
      const accentColor = '#059669'; // Emerald green
      const warningColor = '#dc2626'; // Red
      const borderColor = '#e2e8f0';

      // Helper functions
      const addSectionHeader = (title: string, y: number) => {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text(title.toUpperCase(), 50, y);
        doc.fillColor('black');
        doc.moveTo(50, y + 12).lineTo(545, y + 12).strokeColor(primaryColor).stroke();
        return y + 20;
      };

      const addLabelValue = (label: string, value: string, y: number) => {
        doc.font('Helvetica-Bold').fontSize(10).text(`${label}:`, 50, y);
        doc.font('Helvetica').fontSize(10).text(value, 200, y);
      };

      let currentY = 50;

      // Header with actual logo in top right, with debug output
      const logoPath = path.resolve(__dirname, '../client/public/chainsnobg.png');
      console.log('Resolved logo path:', logoPath);
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 440, 40, { width: 90, height: 90 });
      } else {
        console.error('Logo file does not exist at:', logoPath);
        doc.rect(450, 50, 95, 40).strokeColor(borderColor).stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('LOGO', 470, 65);
        doc.font('Helvetica').fontSize(8).fillColor(secondaryColor).text('CHAINS-ERP', 460, 80);
      }
      doc.font('Helvetica-Bold').fontSize(16).fillColor(primaryColor).text('CHAINS-ERP', 50, currentY);
      currentY += 20;
      doc.font('Helvetica').fontSize(10).fillColor(secondaryColor).text(`Organization: ${data.organization.name || 'Organization'}`, 50, currentY);
      currentY += 15;
      doc.font('Helvetica-Bold').fontSize(14).text('Procurement Request Form', 50, currentY);
      currentY += 15;
      doc.font('Helvetica').fontSize(10).fillColor(secondaryColor).text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 50, currentY);
      currentY += 30;

      // Request Details Section
      currentY = addSectionHeader('REQUEST DETAILS', currentY);

      const requestDetails = [
        ['Request ID', data.id],
        ['Title', data.title],
        ['Description', data.description],
        ['Category', data.category],
        ['Department', data.department || 'Not specified'],
        ['Priority', data.priority],
        ['Urgency', data.urgency],
        ['Estimated Amount', `$${data.estimatedAmount.toLocaleString()}`],
        ['Expected Delivery', data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toLocaleDateString() : 'Not specified'],
        ['Date Requested', new Date(data.createdAt).toLocaleDateString()],
        ['Requestor', `${data.requestor.firstName} ${data.requestor.lastName}`],
        ['Requestor Email', data.requestor.email],
        ['Requestor Department', data.requestor.department]
      ];

      requestDetails.forEach(([label, value]) => {
        addLabelValue(label, value, currentY);
        currentY += 18;
      });

      currentY += 20;

      // Item Details Section
      currentY = addSectionHeader('ITEM DETAILS', currentY);

      addLabelValue('Description', data.description, currentY);
      currentY += 18;
      addLabelValue('Qty', '1', currentY);
      currentY += 18;
      addLabelValue('Unit Price', `$${data.estimatedAmount}`, currentY);
      currentY += 18;
      addLabelValue('Total', `$${data.estimatedAmount}`, currentY);
      currentY += 20;

      // Justification Section
      currentY = addSectionHeader('JUSTIFICATION & IMPACT', currentY);

      addLabelValue('Business Justification', data.justification || 'No justification provided', currentY);
      currentY += 18;

      if (data.impactOnOperations) {
        addLabelValue('Operational Impact', data.impactOnOperations, currentY);
        currentY += 18;
      }

      currentY += 20;

      // Additional Details Section
      currentY = addSectionHeader('ADDITIONAL DETAILS', currentY);

      const additionalDetails = [
        ['Preferred Supplier', data.preferredSupplier || 'None specified'],
        ['Budget Code', data.budgetCode || 'Not specified'],
        ['Special Requirements', data.specialRequirements || 'None'],
        ['Alternatives Considered', data.alternativesConsidered || 'None specified'],
        ['Risk Assessment', data.riskAssessment || 'None specified']
      ];

      additionalDetails.forEach(([label, value]) => {
        addLabelValue(label, value, currentY);
        currentY += 18;
      });

      currentY += 20;

      // Approval Section
      currentY = addSectionHeader('APPROVAL SECTION', currentY);

      // Requestor
      doc.font('Helvetica-Bold').fontSize(10).text('Requestor:', 50, currentY);
      doc.font('Helvetica').fontSize(10).text(`${data.requestor.firstName} ${data.requestor.lastName}, Email: ${data.requestor.email}, Date: ${new Date(data.createdAt).toLocaleDateString()}`, 200, currentY);
      currentY += 18;

      // Department Head
      doc.font('Helvetica-Bold').fontSize(10).text('Department Head:', 50, currentY);
      doc.font('Helvetica').fontSize(10).text('Department Head Name, Email: Department Head Email, Date: ___________', 200, currentY);
      currentY += 18;

      // Finance/Procurement
      doc.font('Helvetica-Bold').fontSize(10).text('Finance/Procurement:', 50, currentY);
      if (data.approver) {
        doc.font('Helvetica').fontSize(10).text(`${data.approver.firstName} ${data.approver.lastName}, Email: ${data.approver.email}, Date: ${new Date().toLocaleDateString()}`, 200, currentY);
      } else {
        doc.font('Helvetica').fontSize(10).text('Finance Manager Name, Email: Finance Manager Email, Date: ___________', 200, currentY);
      }
      currentY += 18;

      // Status
      if (data.status) {
        doc.font('Helvetica-Bold').fontSize(10).text('Status:', 50, currentY);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(accentColor).text(data.status.toUpperCase(), 200, currentY);
        doc.fillColor('black');
        currentY += 18;
      }

      currentY += 20;

      // Footer
      doc.font('Helvetica').fontSize(9).fillColor(secondaryColor).text('Generated by Chains-ERP', 50, currentY);

      doc.end();
    });
  }
} 