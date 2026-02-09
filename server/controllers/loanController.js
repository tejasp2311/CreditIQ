import {
  createLoanApplication,
  updateLoanApplication,
  submitLoanApplication,
  getLoanApplications,
  getLoanApplicationById,
} from '../services/loanService.js';
import { AppError } from '../utils/errors.js';

export const createApplication = async (req, res, next) => {
  try {
    const application = await createLoanApplication(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await updateLoanApplication(id, req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await submitLoanApplication(id, req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      skip: req.query.skip ? parseInt(req.query.skip) : undefined,
    };

    const applications = await getLoanApplications(
      req.user.id,
      req.user.role,
      filters
    );

    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await getLoanApplicationById(
      id,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

