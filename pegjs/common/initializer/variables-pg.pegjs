// Common variables for PostgreSQL-like dialects
// Note: This file content is meant to be imported inside { } initializer block

  // Variable list for dependency analysis
  let varList = [];

  // Global tracking sets
  const tableList = new Set();
  const columnList = new Set();
  const customTypes = new Set();
  const tableAlias = {};

