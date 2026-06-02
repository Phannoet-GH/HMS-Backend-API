import response from '../utils/response.js';

const buildSearchFilter = (query, searchFields) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.department) filter.department = query.department;

  if (query.search && searchFields.length) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: 'i' }
    }));
  }

  return filter;
};

export const crudController = (Model, label, searchFields = []) => ({
  create: async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      response.created(res, item, `${label} created successfully`);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const items = await Model.find(buildSearchFilter(req.query, searchFields)).sort({ createdAt: -1 });
      response.ok(res, items);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return response.notFound(res, `${label} not found`);
      response.ok(res, item);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      if (!item) return response.notFound(res, `${label} not found`);
      response.ok(res, item, `${label} updated successfully`);
    } catch (error) {
      next(error);
    }
  },

  remove: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return response.notFound(res, `${label} not found`);
      response.noContent(res);
    } catch (error) {
      next(error);
    }
  }
});
