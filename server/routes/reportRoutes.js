import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  exportToCSV,
  generateLoanReport,
  generateAuditReport,
  generatePDFReport,
  generateStatsSummary,
} from '../utils/reportGenerator.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/reports/loans/csv
 * @desc    Export loan applications to CSV
 * @access  Admin
 */
router.get('/loans/csv', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const data = await generateLoanReport({ status, startDate, endDate });
    
    const csv = exportToCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="loan_applications.csv"');
    res.send(csv);
    
    logger.info(`Loan report exported by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error exporting loan report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export loan report',
    });
  }
});

/**
 * @route   GET /api/reports/loans/pdf
 * @desc    Export loan applications to PDF
 * @access  Admin
 */
router.get('/loans/pdf', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const data = await generateLoanReport({ status, startDate, endDate });
    
    generatePDFReport(data, 'Loan Applications Report', res);
    
    logger.info(`Loan PDF report exported by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error exporting loan PDF report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export loan PDF report',
    });
  }
});

/**
 * @route   GET /api/reports/audit/csv
 * @desc    Export audit logs to CSV
 * @access  Admin
 */
router.get('/audit/csv', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, startDate, endDate } = req.query;
    const data = await generateAuditReport({ action, startDate, endDate });
    
    const csv = exportToCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.send(csv);
    
    logger.info(`Audit log report exported by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error exporting audit report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export audit report',
    });
  }
});

/**
 * @route   GET /api/reports/audit/pdf
 * @desc    Export audit logs to PDF
 * @access  Admin
 */
router.get('/audit/pdf', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, startDate, endDate } = req.query;
    const data = await generateAuditReport({ action, startDate, endDate });
    
    generatePDFReport(data, 'Audit Logs Report', res);
    
    logger.info(`Audit PDF report exported by user ${req.user.id}`);
  } catch (error) {
    logger.error('Error exporting audit PDF report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export audit PDF report',
    });
  }
});

/**
 * @route   GET /api/reports/stats
 * @desc    Get statistics summary
 * @access  Admin
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await generateStatsSummary();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error generating stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate statistics',
    });
  }
});

/**
 * @route   GET /api/reports/my-applications/csv
 * @desc    Export user's own loan applications to CSV
 * @access  Authenticated user
 */
router.get('/my-applications/csv', authenticate, async (req, res) => {
  try {
    const data = await generateLoanReport({ userId: req.user.id });
    
    const csv = exportToCSV(data, Object.keys(data[0] || {}));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="my_applications.csv"');
    res.send(csv);
    
    logger.info(`User ${req.user.id} exported their applications`);
  } catch (error) {
    logger.error('Error exporting user applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export applications',
    });
  }
});

export default router;
