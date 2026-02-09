import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanAPI } from '../services/api';

const LoanApplication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    income: '',
    loanAmount: '',
    tenure: '',
    employmentType: 'SALARIED',
    existingEmis: '0',
    creditScore: '',
    age: '',
    dependents: '0',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveDraft = async () => {
    setError('');
    setLoading(true);
    setIsDraft(true);

    try {
      const data = {
        ...formData,
        income: parseFloat(formData.income),
        loanAmount: parseFloat(formData.loanAmount),
        tenure: parseInt(formData.tenure),
        existingEmis: parseFloat(formData.existingEmis),
        creditScore: parseInt(formData.creditScore),
        age: parseInt(formData.age),
        dependents: parseInt(formData.dependents),
      };

      const response = await loanAPI.create(data);
      navigate(`/application/${response.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to save application');
    } finally {
      setLoading(false);
      setIsDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let applicationId;

      // Create or update application
      if (isDraft) {
        // If we just created a draft, use that ID
        const createResponse = await loanAPI.create({
          ...formData,
          income: parseFloat(formData.income),
          loanAmount: parseFloat(formData.loanAmount),
          tenure: parseInt(formData.tenure),
          existingEmis: parseFloat(formData.existingEmis),
          creditScore: parseInt(formData.creditScore),
          age: parseInt(formData.age),
          dependents: parseInt(formData.dependents),
        });
        applicationId = createResponse.data.id;
      } else {
        // For now, create new application and submit
        const createResponse = await loanAPI.create({
          ...formData,
          income: parseFloat(formData.income),
          loanAmount: parseFloat(formData.loanAmount),
          tenure: parseInt(formData.tenure),
          existingEmis: parseFloat(formData.existingEmis),
          creditScore: parseInt(formData.creditScore),
          age: parseInt(formData.age),
          dependents: parseInt(formData.dependents),
        });
        applicationId = createResponse.data.id;
      }

      // Submit the application
      await loanAPI.submit(applicationId);
      navigate(`/application/${applicationId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">New Loan Application</h1>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Annual Income (₹)</label>
            <input
              type="number"
              name="income"
              required
              min="15000"
              step="1000"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.income}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Loan Amount (₹)</label>
            <input
              type="number"
              name="loanAmount"
              required
              min="50000"
              step="10000"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.loanAmount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tenure (months)</label>
            <input
              type="number"
              name="tenure"
              required
              min="12"
              max="120"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.tenure}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employment Type</label>
            <select
              name="employmentType"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.employmentType}
              onChange={handleChange}
            >
              <option value="SALARIED">Salaried</option>
              <option value="SELF_EMPLOYED">Self Employed</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Existing EMIs (₹)</label>
            <input
              type="number"
              name="existingEmis"
              required
              min="0"
              step="1000"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.existingEmis}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Score</label>
            <input
              type="number"
              name="creditScore"
              required
              min="300"
              max="850"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.creditScore}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              required
              min="21"
              max="70"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dependents</label>
            <input
              type="number"
              name="dependents"
              required
              min="0"
              max="10"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.dependents}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplication;

