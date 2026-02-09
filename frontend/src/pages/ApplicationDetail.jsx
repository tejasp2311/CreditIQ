import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await loanAPI.getById(id);
      setApplication(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (application.status !== 'DRAFT') {
      return;
    }

    setSubmitting(true);
    try {
      await loanAPI.submit(id);
      fetchApplication(); // Refresh to get updated status
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskBandColor = (band) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
    };
    return colors[band] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error && !application) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const decision = application.decisions && application.decisions[0];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Application Information</h2>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              application.status
            )}`}
          >
            {application.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Loan Amount</p>
            <p className="text-lg font-medium">₹{application.loanAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Annual Income</p>
            <p className="text-lg font-medium">₹{application.income.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tenure</p>
            <p className="text-lg font-medium">{application.tenure} months</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Employment Type</p>
            <p className="text-lg font-medium">{application.employmentType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Credit Score</p>
            <p className="text-lg font-medium">{application.creditScore}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="text-lg font-medium">{application.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Existing EMIs</p>
            <p className="text-lg font-medium">₹{application.existingEmis.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dependents</p>
            <p className="text-lg font-medium">{application.dependents}</p>
          </div>
        </div>

        {application.status === 'DRAFT' && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        )}
      </div>

      {decision && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Decision</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Decision</p>
              <p className="text-lg font-medium">{decision.decision}</p>
            </div>
            {decision.probability !== null && (
              <div>
                <p className="text-sm text-gray-500">Default Probability</p>
                <p className="text-lg font-medium">
                  {(decision.probability * 100).toFixed(2)}%
                </p>
              </div>
            )}
            {decision.riskBand && (
              <div>
                <p className="text-sm text-gray-500">Risk Band</p>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getRiskBandColor(
                    decision.riskBand
                  )}`}
                >
                  {decision.riskBand}
                </span>
              </div>
            )}
            {decision.policyReason && (
              <div>
                <p className="text-sm text-gray-500">Policy Reason</p>
                <p className="text-sm text-red-600">{decision.policyReason}</p>
              </div>
            )}
            {decision.explanations && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Key Factors</p>
                <ul className="space-y-2">
                  {decision.explanations.slice(0, 5).map((explanation, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">{explanation.feature}:</span>{' '}
                      <span className={explanation.impact === 'positive' ? 'text-green-600' : 'text-red-600'}>
                        {explanation.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {decision.modelVersion && (
              <div>
                <p className="text-sm text-gray-500">Model Version</p>
                <p className="text-sm">{decision.modelVersion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;

