/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header];
        
        // Handle different data types
        if (cell === null || cell === undefined) {
          cell = '';
        } else if (typeof cell === 'object') {
          cell = JSON.stringify(cell);
        } else {
          cell = String(cell);
        }
        
        // Escape quotes and wrap in quotes if contains comma
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Export applications to CSV
 */
export const exportApplicationsToCSV = (applications) => {
  const data = applications.map(app => ({
    'Application ID': app.id,
    'Status': app.status,
    'Loan Amount': app.loanAmount,
    'Tenure (Months)': app.tenure,
    'Annual Income': app.income,
    'Existing EMIs': app.existingEmis,
    'Credit Score': app.creditScore,
    'Age': app.age,
    'Dependents': app.dependents,
    'Employment Type': app.employmentType,
    'Created Date': new Date(app.createdAt).toLocaleString(),
    'Submitted Date': app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'N/A',
    'Decision': app.decisions && app.decisions.length > 0 ? app.decisions[0].decision : 'Pending',
    'Risk Band': app.decisions && app.decisions.length > 0 ? app.decisions[0].riskBand || 'N/A' : 'N/A',
    'Default Probability': app.decisions && app.decisions.length > 0 ? app.decisions[0].probability || 'N/A' : 'N/A',
    'Policy Passed': app.decisions && app.decisions.length > 0 ? app.decisions[0].policyPassed : 'N/A',
  }));

  const filename = `loan-applications-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, filename);
};

/**
 * Export audit logs to CSV
 */
export const exportAuditLogsToCSV = (logs) => {
  const data = logs.map(log => ({
    'Log ID': log.id,
    'Action': log.action,
    'Actor ID': log.actorId || 'System',
    'Entity Type': log.entityType || 'N/A',
    'Entity ID': log.entityId || 'N/A',
    'Metadata': log.metadata ? JSON.stringify(log.metadata) : '',
    'Timestamp': new Date(log.createdAt).toLocaleString(),
  }));

  const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, filename);
};

/**
 * Print applications report
 */
export const printApplicationsReport = (applications) => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loan Applications Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #1f2937;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>Loan Applications Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <p>Total Applications: ${applications.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>Loan Amount</th>
            <th>Income</th>
            <th>Credit Score</th>
            <th>Status</th>
            <th>Risk Band</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
          ${applications.map(app => `
            <tr>
              <td>₹${app.loanAmount.toLocaleString()}</td>
              <td>₹${app.income.toLocaleString()}</td>
              <td>${app.creditScore}</td>
              <td>${app.status}</td>
              <td>${app.decisions && app.decisions.length > 0 ? app.decisions[0].riskBand || 'N/A' : 'N/A'}</td>
              <td>${new Date(app.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>CreditIQ - AI-Powered Loan Underwriting Platform</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Helper function to download blob
 */
const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy data to clipboard
 */
export const copyToClipboard = (text) => {
  return navigator.clipboard.writeText(text);
};

export default {
  exportToCSV,
  exportApplicationsToCSV,
  exportAuditLogsToCSV,
  printApplicationsReport,
  copyToClipboard,
};
