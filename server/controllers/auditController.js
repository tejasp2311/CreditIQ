import { getAuditLogs } from '../services/auditService.js';
import { AppError } from '../utils/errors.js';

export const getLogs = async (req, res, next) => {
  try {
    const filters = {
      actorId: req.query.actorId,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      action: req.query.action,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      skip: req.query.skip ? parseInt(req.query.skip) : undefined,
    };

    const logs = await getAuditLogs(filters);

    res.status(200).json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    next(error);
  }
};

