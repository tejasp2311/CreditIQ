import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export const createAuditLog = async (data) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        actorId: data.actorId || null,
        action: data.action,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        metadata: data.metadata || null,
      },
    });

    logger.info('Audit log created', {
      action: data.action,
      actorId: data.actorId,
      entityType: data.entityType,
      entityId: data.entityId,
    });

    return auditLog;
  } catch (error) {
    logger.error('Failed to create audit log', { error: error.message, data });
    // Don't throw - audit logging should not break the main flow
    return null;
  }
};

export const getAuditLogs = async (filters = {}) => {
  try {
    const where = {};

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters.entityType && filters.entityId) {
      where.entityType = filters.entityType;
      where.entityId = filters.entityId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const auditLogs = await prisma.auditLog.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters.limit || 100,
      skip: filters.skip || 0,
    });

    return auditLogs;
  } catch (error) {
    logger.error('Failed to fetch audit logs', { error: error.message });
    throw error;
  }
};

