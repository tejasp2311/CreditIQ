import React, { useState, useEffect } from 'react';
import { PieChart, BarChart, StatCard, LineChart } from '../components/Charts';
import api from '../services/api';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [loansRes, auditRes] = await Promise.all([
        api.get('/loans'),
        api.get('/audit'),
      ]);

      const loans = loansRes.data.data;
      const auditLogs = auditRes.data.data;

      // Calculate analytics
      const totalApplications = loans.length;
      const approvedCount = loans.filter(l => l.status === 'APPROVED').length;
      const rejectedCount = loans.filter(l => l.status === 'REJECTED').length;
      const submittedCount = loans.filter(l => l.status === 'SUBMITTED').length;
      const draftCount = loans.filter(l => l.status === 'DRAFT').length;

      const approvalRate = totalApplications > 0 
        ? ((approvedCount / (approvedCount + rejectedCount)) * 100).toFixed(1)
        : 0;

      // Total loan amount
      const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
      const avgLoanAmount = totalApplications > 0 
        ? (totalLoanAmount / totalApplications).toFixed(0)
        : 0;

      // Risk band distribution (from decisions)
      const loansWithDecisions = loans.filter(l => l.decisions && l.decisions.length > 0);
      const riskBands = { LOW: 0, MEDIUM: 0, HIGH: 0 };
      loansWithDecisions.forEach(loan => {
        const decision = loan.decisions[0];
        if (decision.riskBand) {
          riskBands[decision.riskBand]++;
        }
      });

      // Applications by employment type
      const employmentTypes = {};
      loans.forEach(loan => {
        employmentTypes[loan.employmentType] = (employmentTypes[loan.employmentType] || 0) + 1;
      });

      // Applications over time (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = loans.filter(l => 
          l.createdAt.split('T')[0] === dateStr
        ).length;
        last7Days.push({
          name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: count,
        });
      }

      setAnalytics({
        totalApplications,
        approvedCount,
        rejectedCount,
        submittedCount,
        draftCount,
        approvalRate,
        totalLoanAmount,
        avgLoanAmount,
        statusDistribution: [
          { name: 'APPROVED', value: approvedCount },
          { name: 'REJECTED', value: rejectedCount },
          { name: 'SUBMITTED', value: submittedCount },
          { name: 'DRAFT', value: draftCount },
        ],
        riskDistribution: Object.entries(riskBands).map(([name, value]) => ({
          name,
          value,
        })),
        employmentDistribution: Object.entries(employmentTypes).map(([name, value]) => ({
          name,
          value,
        })),
        applicationsOverTime: last7Days,
      });

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Applications"
          value={analytics.totalApplications}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Approval Rate"
          value={`${analytics.approvalRate}%`}
          subtitle={`${analytics.approvedCount} approved`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Loan Amount"
          value={`₹${(analytics.totalLoanAmount / 10000000).toFixed(1)}Cr`}
          subtitle={`Avg: ₹${(analytics.avgLoanAmount / 100000).toFixed(1)}L`}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Review"
          value={analytics.submittedCount}
          subtitle="Requires attention"
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PieChart
          data={analytics.statusDistribution}
          title="Applications by Status"
        />
        {analytics.riskDistribution.some(r => r.value > 0) && (
          <PieChart
            data={analytics.riskDistribution}
            title="Risk Band Distribution"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <LineChart
          data={analytics.applicationsOverTime}
          title="Applications Over Time (Last 7 Days)"
          yLabel="Number of Applications"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BarChart
          data={analytics.employmentDistribution}
          title="Applications by Employment Type"
          yLabel="Number of Applications"
        />
      </div>
    </div>
  );
};

export default AdminAnalytics;
