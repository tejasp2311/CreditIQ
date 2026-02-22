import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant.toLowerCase()] || variants.default} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

export const StatusBadge = ({ status }) => {
  const statusMap = {
    DRAFT: { variant: 'draft', text: 'Draft' },
    SUBMITTED: { variant: 'submitted', text: 'Submitted' },
    UNDER_REVIEW: { variant: 'under_review', text: 'Under Review' },
    APPROVED: { variant: 'approved', text: 'Approved' },
    REJECTED: { variant: 'rejected', text: 'Rejected' },
  };

  const config = statusMap[status] || { variant: 'default', text: status };

  return <Badge variant={config.variant}>{config.text}</Badge>;
};

export const RiskBadge = ({ riskBand }) => {
  const riskMap = {
    LOW: { variant: 'success', text: 'Low Risk', icon: '🟢' },
    MEDIUM: { variant: 'warning', text: 'Medium Risk', icon: '🟡' },
    HIGH: { variant: 'danger', text: 'High Risk', icon: '🔴' },
  };

  const config = riskMap[riskBand] || { variant: 'default', text: riskBand };

  return (
    <Badge variant={config.variant}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </Badge>
  );
};
