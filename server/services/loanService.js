import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { evaluateCreditPolicy } from './creditPolicyService.js';
import { getMLPrediction } from './mlService.js';
import { createAuditLog } from './auditService.js';

const prisma = new PrismaClient();

export const createLoanApplication = async (userId, applicationData) => {
  try {
    const application = await prisma.loanApplication.create({
      data: {
        userId,
        ...applicationData,
        status: 'DRAFT',
      },
    });

    await createAuditLog({
      actorId: userId,
      action: 'LOAN_CREATED',
      entityType: 'LoanApplication',
      entityId: application.id,
      metadata: { status: 'DRAFT' },
    });

    return application;
  } catch (error) {
    logger.error('Failed to create loan application', { error: error.message });
    throw error;
  }
};

export const updateLoanApplication = async (applicationId, userId, updates) => {
  try {
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (application.status !== 'DRAFT') {
      throw new AppError('Cannot update submitted application', 400);
    }

    const updated = await prisma.loanApplication.update({
      where: { id: applicationId },
      data: updates,
    });

    await createAuditLog({
      actorId: userId,
      action: 'LOAN_UPDATED',
      entityType: 'LoanApplication',
      entityId: applicationId,
      metadata: { updates },
    });

    return updated;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to update loan application', { error: error.message });
    throw error;
  }
};

export const submitLoanApplication = async (applicationId, userId) => {
  try {
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (application.status !== 'DRAFT') {
      throw new AppError('Application already submitted', 400);
    }

    // Mark as submitted
    const submitted = await prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    await createAuditLog({
      actorId: userId,
      action: 'LOAN_SUBMITTED',
      entityType: 'LoanApplication',
      entityId: applicationId,
    });

    // Evaluate credit policy
    const policyResult = evaluateCreditPolicy(application);

    let decision;
    let probability = null;
    let riskBand = null;
    let modelVersion = null;
    let explanations = null;

    if (!policyResult.passed) {
      // Policy failed - auto reject
      decision = await prisma.loanDecision.create({
        data: {
          applicationId,
          decision: 'REJECTED',
          policyPassed: false,
          policyReason: policyResult.reason,
        },
      });

      await createAuditLog({
        actorId: userId,
        action: 'POLICY_REJECTED',
        entityType: 'LoanApplication',
        entityId: applicationId,
        metadata: { reason: policyResult.reason },
      });

      // Update application status
      await prisma.loanApplication.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' },
      });
    } else {
      // Policy passed - call ML service
      try {
        const mlResult = await getMLPrediction(application);

        probability = mlResult.probability;
        riskBand = mlResult.risk_band;
        modelVersion = mlResult.model_version;
        explanations = mlResult.explanations;

        // Decision threshold: approve if default probability < 0.4 (low risk)
        // Reject if default probability >= 0.4 (medium/high risk)
        const finalDecision = probability < 0.4 ? 'APPROVED' : 'REJECTED';

        decision = await prisma.loanDecision.create({
          data: {
            applicationId,
            decision: finalDecision,
            probability,
            riskBand,
            policyPassed: true,
            modelVersion,
            explanations,
          },
        });

        await createAuditLog({
          actorId: userId,
          action: 'ML_EVALUATED',
          entityType: 'LoanApplication',
          entityId: applicationId,
          metadata: {
            probability,
            riskBand,
            modelVersion,
          },
        });

        await createAuditLog({
          actorId: userId,
          action: 'DECISION_CREATED',
          entityType: 'LoanDecision',
          entityId: decision.id,
          metadata: {
            decision: finalDecision,
            probability,
            riskBand,
          },
        });

        // Update application status
        await prisma.loanApplication.update({
          where: { id: applicationId },
          data: { status: finalDecision },
        });
      } catch (mlError) {
        logger.error('ML service failed', { error: mlError.message });
        // If ML fails, we still create a decision but mark it as policy-only
        decision = await prisma.loanDecision.create({
          data: {
            applicationId,
            decision: 'REJECTED',
            policyPassed: true,
            policyReason: 'ML service unavailable',
          },
        });

        await prisma.loanApplication.update({
          where: { id: applicationId },
          data: { status: 'REJECTED' },
        });
      }
    }

    return {
      application: submitted,
      decision,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to submit loan application', { error: error.message });
    throw error;
  }
};

export const getLoanApplications = async (userId, role, filters = {}) => {
  try {
    const where = {};

    // Users can only see their own applications
    if (role === 'USER') {
      where.userId = userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const applications = await prisma.loanApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        decisions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters.limit || 50,
      skip: filters.skip || 0,
    });

    return applications;
  } catch (error) {
    logger.error('Failed to fetch loan applications', { error: error.message });
    throw error;
  }
};

export const getLoanApplicationById = async (applicationId, userId, role) => {
  try {
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        decisions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Users can only see their own applications
    if (role === 'USER' && application.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return application;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to fetch loan application', { error: error.message });
    throw error;
  }
};

