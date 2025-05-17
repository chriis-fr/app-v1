import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ITermination, IExitInterview } from '../mongodb/models/hr';
import User from '../models/User';

interface GeneratedDocument {
  url: string;
  filename: string;
}

interface DocumentTemplate {
  title: string;
  content: string;
  metadata: {
    type: string;
    generatedAt: Date;
    referenceNumber: string;
  };
}

export class DocumentGenerator {
  private static generateReferenceNumber(prefix: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  static generateTerminationLetter(termination: ITermination): DocumentTemplate {
    const referenceNumber = this.generateReferenceNumber('TERM');
    
    return {
      title: 'Termination Letter',
      content: `
        TERMINATION LETTER
        Reference: ${referenceNumber}
        Date: ${termination.terminationDate.toLocaleDateString()}

        This letter serves as formal notice of termination of employment.

        Reason for Termination:
        ${termination.reason}

        Termination Date: ${termination.terminationDate.toLocaleDateString()}

        Status: ${termination.status.toUpperCase()}

        This document has been generated on ${new Date().toLocaleDateString()}
        and is valid for official purposes.
      `,
      metadata: {
        type: 'termination_letter',
        generatedAt: new Date(),
        referenceNumber
      }
    };
  }

  static generateExitInterviewReport(exitInterview: IExitInterview): DocumentTemplate {
    const referenceNumber = this.generateReferenceNumber('EXIT');
    
    return {
      title: 'Exit Interview Report',
      content: `
        EXIT INTERVIEW REPORT
        Reference: ${referenceNumber}
        Date: ${exitInterview.date.toLocaleDateString()}

        Employee ID: ${exitInterview.employeeId}
        Interview Date: ${exitInterview.date.toLocaleDateString()}

        Reason for Leaving:
        ${exitInterview.reasonForLeaving}

        Destination:
        Type: ${exitInterview.destination.type}
        ${exitInterview.destination.details ? `Details: ${exitInterview.destination.details}` : ''}

        Feedback Summary:
        ${exitInterview.feedback.map(f => `
          Category: ${f.category}
          Rating: ${f.rating}/5
          Comments: ${f.comments}
        `).join('\n')}

        Recommendations:
        ${exitInterview.recommendations.map(r => `- ${r}`).join('\n')}

        This document has been generated on ${new Date().toLocaleDateString()}
        and is valid for official purposes.
      `,
      metadata: {
        type: 'exit_interview_report',
        generatedAt: new Date(),
        referenceNumber
      }
    };
  }

  static generateTerminationCertificate(termination: ITermination): DocumentTemplate {
    const referenceNumber = this.generateReferenceNumber('CERT');
    
    return {
      title: 'Termination Certificate',
      content: `
        TERMINATION CERTIFICATE
        Reference: ${referenceNumber}
        Date: ${termination.terminationDate.toLocaleDateString()}

        This is to certify that the employment has been terminated
        on ${termination.terminationDate.toLocaleDateString()}.

        Status: ${termination.status.toUpperCase()}

        This document has been generated on ${new Date().toLocaleDateString()}
        and is valid for official purposes.
      `,
      metadata: {
        type: 'termination_certificate',
        generatedAt: new Date(),
        referenceNumber
      }
    };
  }
}

export const generateTerminationLetter = async (termination: ITermination): Promise<GeneratedDocument> => {
  const employee = await User.findById(termination.employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  const doc = new PDFDocument();
  const filename = `termination_letter_${employee.employeeId}_${Date.now()}.pdf`;
  const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(process.env.UPLOAD_DIR || 'uploads')) {
    fs.mkdirSync(process.env.UPLOAD_DIR || 'uploads', { recursive: true });
  }

  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Add company letterhead
  doc.fontSize(20).text('COMPANY NAME', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('123 Business Street', { align: 'center' });
  doc.text('City, State, ZIP', { align: 'center' });
  doc.moveDown(2);

  // Add date
  doc.fontSize(12).text(new Date().toLocaleDateString(), { align: 'right' });
  doc.moveDown(2);

  // Add employee details
  doc.fontSize(12).text(`${employee.firstName} ${employee.lastName}`);
  doc.text(employee.address || '');
  doc.text(`${employee.city || ''}, ${employee.state || ''} ${employee.zip || ''}`);
  doc.moveDown(2);

  // Add subject
  doc.fontSize(14).text('Termination Letter', { align: 'center' });
  doc.moveDown(2);

  // Add content
  doc.fontSize(12).text(`Dear ${employee.firstName} ${employee.lastName},`);
  doc.moveDown();
  doc.text(`This letter is to confirm that your employment with ${process.env.COMPANY_NAME || 'our company'} will be terminated effective ${termination.terminationDate.toLocaleDateString()}.`);
  doc.moveDown();
  doc.text(`Reason for termination: ${termination.reason}`);
  doc.moveDown();
  doc.text('Please note the following:');
  doc.moveDown();
  doc.text('1. Your final paycheck will be processed according to company policy.');
  doc.text('2. All company property must be returned by your last day of employment.');
  doc.text('3. Your benefits will continue until the end of the month.');
  doc.text('4. You will receive information about your retirement benefits separately.');
  doc.moveDown();
  doc.text('We appreciate your contributions during your time with us and wish you success in your future endeavors.');
  doc.moveDown(2);
  doc.text('Sincerely,');
  doc.moveDown(2);
  doc.text('HR Department');
  doc.text(process.env.COMPANY_NAME || 'Company Name');

  // Add footer
  doc.fontSize(10).text('This is a computer-generated document and does not require a signature.', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve({
        url: `/uploads/${filename}`,
        filename
      });
    });
    stream.on('error', reject);
  });
};

export const generateExitInterviewReport = async (data: {
  employeeId: string;
  date: Date;
  reasonForLeaving: string;
  destination: {
    type: string;
    details?: string;
  };
  feedback: Array<{
    category: string;
    rating: number;
    comments: string;
  }>;
  recommendations: string[];
}): Promise<GeneratedDocument> => {
  const employee = await User.findById(data.employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  const doc = new PDFDocument();
  const filename = `exit_interview_${employee.employeeId}_${Date.now()}.pdf`;
  const filepath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(process.env.UPLOAD_DIR || 'uploads')) {
    fs.mkdirSync(process.env.UPLOAD_DIR || 'uploads', { recursive: true });
  }

  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Add company letterhead
  doc.fontSize(20).text('COMPANY NAME', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('123 Business Street', { align: 'center' });
  doc.text('City, State, ZIP', { align: 'center' });
  doc.moveDown(2);

  // Add title
  doc.fontSize(16).text('Exit Interview Report', { align: 'center' });
  doc.moveDown(2);

  // Add interview details
  doc.fontSize(12).text(`Date: ${data.date.toLocaleDateString()}`);
  doc.text(`Employee: ${employee.firstName} ${employee.lastName}`);
  doc.text(`Position: ${employee.position}`);
  doc.text(`Department: ${employee.department}`);
  doc.moveDown();

  // Add reason for leaving
  doc.fontSize(14).text('Reason for Leaving');
  doc.fontSize(12).text(data.reasonForLeaving);
  doc.moveDown();

  // Add destination
  doc.fontSize(14).text('Destination');
  doc.fontSize(12).text(`Type: ${data.destination.type}`);
  if (data.destination.details) {
    doc.text(`Details: ${data.destination.details}`);
  }
  doc.moveDown();

  // Add feedback
  doc.fontSize(14).text('Feedback');
  data.feedback.forEach((f) => {
    doc.fontSize(12).text(`Category: ${f.category}`);
    doc.text(`Rating: ${f.rating}/5`);
    doc.text(`Comments: ${f.comments}`);
    doc.moveDown();
  });

  // Add recommendations
  if (data.recommendations.length > 0) {
    doc.fontSize(14).text('Recommendations');
    data.recommendations.forEach((r) => {
      doc.fontSize(12).text(`• ${r}`);
    });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      resolve({
        url: `/uploads/${filename}`,
        filename
      });
    });
    stream.on('error', reject);
  });
}; 