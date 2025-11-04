const { DBSQLClient } = require('@databricks/sql');

class DatabricksConnection {
  constructor() {
    this.client = null;
    this.session = null;
  }

  async connect() {
    if (this.session) {
      return this.session;
    }

    const serverHostname = process.env.DATABRICKS_SERVER_HOSTNAME;
    const httpPath = process.env.DATABRICKS_HTTP_PATH;
    const token = process.env.DATABRICKS_TOKEN;

    if (!serverHostname || !httpPath || !token) {
      throw new Error('Missing required Databricks environment variables: DATABRICKS_SERVER_HOSTNAME, DATABRICKS_HTTP_PATH, DATABRICKS_TOKEN');
    }

    this.client = new DBSQLClient();

    this.session = await this.client.connect({
      host: serverHostname,
      path: httpPath,
      token: token,
    });

    return this.session;
  }

  async executeQuery(query, parameters = []) {
    try {
      const session = await this.connect();
      const queryOperation = await session.executeStatement(query, {
        parameters: parameters,
      });

      const result = await queryOperation.fetchAll();
      await queryOperation.close();

      return result;
    } catch (error) {
      console.error('Error executing Databricks query:', error);
      throw error;
    }
  }

  async close() {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

// Singleton instance to reuse connections across Lambda invocations
let databricksInstance = null;

function getDatabricksConnection() {
  if (!databricksInstance) {
    databricksInstance = new DatabricksConnection();
  }
  return databricksInstance;
}

module.exports = { getDatabricksConnection };
