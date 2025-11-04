const { GraphQLScalarType, Kind } = require('graphql');
const { getDatabricksConnection } = require('./databricks');

// Custom scalar for generic row data
const RowScalar = new GraphQLScalarType({
  name: 'Row',
  description: 'Represents a database row as a JSON object',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

const resolvers = {
  Row: RowScalar,

  Query: {
    executeQuery: async (_, { sql }) => {
      const db = getDatabricksConnection();

      try {
        const result = await db.executeQuery(sql);

        return {
          rows: result,
          rowCount: result.length,
        };
      } catch (error) {
        console.error('Error executing query:', error);
        throw new Error(`Failed to execute query: ${error.message}`);
      }
    },

    getTables: async (_, { database }) => {
      const db = getDatabricksConnection();

      try {
        const sql = `SHOW TABLES IN ${database}`;
        const result = await db.executeQuery(sql);

        return result.map(row => ({
          name: row.tableName || row.table_name,
          database: row.database || database,
        }));
      } catch (error) {
        console.error('Error getting tables:', error);
        throw new Error(`Failed to get tables from database ${database}: ${error.message}`);
      }
    },

    getTableData: async (_, { database, table, limit }) => {
      const db = getDatabricksConnection();

      try {
        const sql = `SELECT * FROM ${database}.${table} LIMIT ${limit}`;
        const result = await db.executeQuery(sql);

        return result;
      } catch (error) {
        console.error('Error getting table data:', error);
        throw new Error(`Failed to get data from ${database}.${table}: ${error.message}`);
      }
    },
  },
};

module.exports = { resolvers };
