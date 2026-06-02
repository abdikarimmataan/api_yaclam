require("dotenv").config();
const Pagination = require("../models/pagiantion.model");

module.exports = {
  paginationParams: async (req, totalItems) => {
    const defaultPage = parseInt(process.env.DEFAULT_PAGE, 10) || 1;
    const defaultPageSize = parseInt(process.env.DEFAULT_PAGESIZE, 10) || 10;
    const pagination = new Pagination({});

    pagination.page = parseInt(req.query.page, 10) || defaultPage;
    pagination.pageSize = parseInt(req.query.pageSize, 10) || defaultPageSize;
    pagination.rows = totalItems;
    pagination.pages = Math.ceil(totalItems / pagination.pageSize) || 0;
    const skip = (pagination.page - 1) * pagination.pageSize;

    return { pagination, skip };
  },
};
