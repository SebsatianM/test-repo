const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Query {
    """
    Execute a custom SQL query against Databricks
    """
    executeQuery(sql: String!): QueryResult!

    """
    Get tables from a specific schema/database
    """
    getTables(database: String!): [Table!]!

    """
    Get data from a specific table with optional limit
    """
    getTableData(database: String!, table: String!, limit: Int = 100): [Row!]!
  }

  type QueryResult {
    rows: [Row!]!
    rowCount: Int!
  }

  type Table {
    name: String!
    database: String!
  }

  """
  Generic row representation as JSON
  """
  scalar Row
`;

module.exports = { typeDefs };
