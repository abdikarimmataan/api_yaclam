module.exports = {
  errorResponse: (res, statusCode, error) =>
    res.status(statusCode).json({ message: error.message || String(error) }),

  successResponse: (res, statusCode, model) => res.status(statusCode).json(model),

  customResponse: (res, statusCode, result) =>
    res.status(statusCode).json({ message: result }),

  paginationResponse: (res, statusCode, pagination) =>
    res.status(statusCode).json({
      page: pagination.page,
      pages: pagination.pages,
      pageSize: pagination.pageSize,
      rows: pagination.rows,
      data: pagination.data,
    }),
};
