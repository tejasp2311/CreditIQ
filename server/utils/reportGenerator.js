import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import prisma from './prisma.js';
import logger from './logger.js';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    logger.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
};

/**
 * Generate loan applications report
 */
export const generateLoanReport = async (filters = {}) => {
  const { status, startDate, endDate, userId } = filters;

  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const loans = await prisma.loanApplication.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      decisions: {
        select: {
          decision: true,
          probability: true,
          riskBand: true,
          policyPassed: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const reportData = loans.map(loan => ({
    'Application ID': loan.id,
    'Applicant Name': `${loan.user.firstName} ${loan.user.lastName}`,
    'Email': loan.user.email,
    'Status': loan.status,
    'Loan Amount': loan.loanAmount,
    'Tenure (months)': loan.tenure,
    'Income': loan.income,
    'Credit Score': loan.creditScore,
    'Employment Type': loan.employmentType,
    'Age': loan.age,
    'Dependents': loan.dependents,
    'Existing EMIs': loan.existingEmis,
    'Decision': loan.decisions[0]?.decision || 'Pending',
    'Risk Band': loan.decisions[0]?.riskBand || 'N/A',
    'Default Probability': loan.decisions[0]?.probability ? 
      (loan.decisions[0].probability * 100).toFixed(2) + '%' : 'N/A',
    'Submitted At': loan.submittedAt?.toISOString() || 'Not submitted',
    'Created At': loan.createdAt.toISOString(),
  }));

  return reportData;
};

/**
 * Generate audit log report
 */
export const generateAuditReport = async (filters = {}) => {
  const { action, startDate, endDate, actorId } = filters;

  const where = {};
  if (action) where.action = action;
  if (actorId) where.actorId = actorId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const reportData = logs.map(log => ({
    'Log ID': log.id,
    'Actor': log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
    'Email': log.user?.email || 'N/A',
    'Role': log.user?.role || 'System',
    'Action': log.action,
    'Entity Type': log.entityType || 'N/A',
    'Entity ID': log.entityId || 'N/A',
    'Metadata': JSON.stringify(log.metadata || {}),
    'Timestamp': log.createdAt.toISOString(),
  }));

  return reportData;
};

/**
 * Generate PDF report
 */
export const generatePDFReport = (data, title, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);

  // Pipe PDF to response
  doc.pipe(res);

  // Add title
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();

  // Add generation date
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown();

  // Add summary
  doc.fontSize(12).text(`Total Records: ${data.length}`, { align: 'left' });
  doc.moveDown();

  // Add table header
  const keys = Object.keys(data[0] || {});
  const tableTop = doc.y;
  let currentY = tableTop;

  doc.fontSize(8);

  // Draw header row
  keys.forEach((key, i) => {
    doc.text(key, 50 + i * 100, currentY, { width: 90, ellipsis: true });
  });

  currentY += 20;
  doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 5;

  // Draw data rows (limit to first 100 for PDF)
  const limitedData = data.slice(0, 100);
  limitedData.forEach((row, rowIndex) => {
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    keys.forEach((key, i) => {
      const value = String(row[key] || '').substring(0, 50);
      doc.text(value, 50 + i * 100, currentY, { width: 90, ellipsis: true });
    });

    currentY += 20;
  });

  if (data.length > 100) {
    doc.moveDown();
    doc.text(`Note: Showing first 100 of ${data.length} records. Export to CSV for complete data.`);
  }

  // Finalize PDF
  doc.end();
};

/**
 * Generate statistics summary
 */
export const generateStatsSummary = async () => {
  const [
    totalApplications,
    approvedCount,
    rejectedCount,
    submittedCount,
    totalUsers,
    totalAuditLogs,
  ] = await Promise.all([
    prisma.loanApplication.count(),
    prisma.loanApplication.count({ where: { status: 'APPROVED' } }),
    prisma.loanApplication.count({ where: { status: 'REJECTED' } }),
    prisma.loanApplication.count({ where: { status: 'SUBMITTED' } }),
    prisma.user.count(),
    prisma.auditLog.count(),
  ]);

  const totalLoanAmount = await prisma.loanApplication.aggregate({
    _sum: { loanAmount: true },
  });

  const approvalRate = (approvedCount + rejectedCount) > 0 
    ? ((approvedCount / (approvedCount + rejectedCount)) * 100).toFixed(2)
    : 0;

  return {
    totalApplications,
    approvedCount,
    rejectedCount,
    submittedCount,
    totalUsers,
    totalAuditLogs,
    totalLoanAmount: totalLoanAmount._sum.loanAmount || 0,
    approvalRate: `${approvalRate}%`,
    generatedAt: new Date().toISOString(),
  };
};
