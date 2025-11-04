# Databricks GraphQL Lambda

An AWS Lambda function that connects to Databricks and serves a GraphQL API for querying data.

## Features

- GraphQL API endpoint for querying Databricks data
- Reusable connection pooling for optimal Lambda performance
- Support for custom SQL queries
- Built-in queries for listing tables and fetching table data
- AWS Lambda ready with Apollo Server integration

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│  API Gateway │─────▶│   Lambda    │
│  (GraphQL)  │◀─────│              │◀─────│  (Apollo)   │
└─────────────┘      └──────────────┘      └──────┬──────┘
                                                   │
                                                   │
                                            ┌──────▼──────┐
                                            │ Databricks  │
                                            │   Cluster   │
                                            └─────────────┘
```

## Prerequisites

- Node.js 18.x or later
- AWS Account with Lambda access
- Databricks workspace with SQL Warehouse
- Databricks Personal Access Token

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd databricks-graphql-lambda
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Databricks credentials:
- `DATABRICKS_SERVER_HOSTNAME`: Your Databricks workspace hostname
- `DATABRICKS_HTTP_PATH`: The HTTP path to your SQL warehouse
- `DATABRICKS_TOKEN`: Your Databricks personal access token

## Project Structure

```
.
├── src/
│   ├── index.js          # Lambda handler with Apollo Server
│   ├── schema.js         # GraphQL type definitions
│   ├── resolvers.js      # GraphQL resolvers
│   └── databricks.js     # Databricks connection manager
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## GraphQL API

### Queries

#### 1. Execute Custom SQL Query
```graphql
query {
  executeQuery(sql: "SELECT * FROM my_database.my_table LIMIT 10") {
    rows
    rowCount
  }
}
```

#### 2. List Tables in a Database
```graphql
query {
  getTables(database: "my_database") {
    name
    database
  }
}
```

#### 3. Get Table Data
```graphql
query {
  getTableData(
    database: "my_database"
    table: "my_table"
    limit: 50
  )
}
```

## Deployment to AWS Lambda

### Option 1: AWS Console

1. Create a new Lambda function in AWS Console
2. Set runtime to Node.js 18.x or later
3. Package your code:
```bash
npm install --production
zip -r function.zip . -x "*.git*"
```

4. Upload `function.zip` to your Lambda function
5. Set environment variables in Lambda configuration:
   - `DATABRICKS_SERVER_HOSTNAME`
   - `DATABRICKS_HTTP_PATH`
   - `DATABRICKS_TOKEN`

6. Set handler to: `src/index.handler`
7. Configure timeout (recommended: 30 seconds minimum)
8. Configure memory (recommended: 512 MB minimum)

### Option 2: AWS CLI

```bash
# Package the function
npm install --production
zip -r function.zip . -x "*.git*"

# Create the function
aws lambda create-function \
  --function-name databricks-graphql-lambda \
  --runtime nodejs18.x \
  --handler src/index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/YOUR_LAMBDA_ROLE \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    DATABRICKS_SERVER_HOSTNAME=your-workspace.cloud.databricks.com,
    DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your-warehouse-id,
    DATABRICKS_TOKEN=your-token
  }"

# Update existing function
npm run deploy
```

### Option 3: AWS SAM or Serverless Framework

You can also deploy using infrastructure-as-code tools. Here's a basic SAM template example:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  DatabricksGraphQLFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/index.handler
      Runtime: nodejs18.x
      Timeout: 30
      MemorySize: 512
      Environment:
        Variables:
          DATABRICKS_SERVER_HOSTNAME: !Ref DatabricksHostname
          DATABRICKS_HTTP_PATH: !Ref DatabricksHttpPath
          DATABRICKS_TOKEN: !Ref DatabricksToken
      Events:
        GraphQLApi:
          Type: Api
          Properties:
            Path: /graphql
            Method: ANY
```

## Setting up API Gateway

1. Create a new HTTP API or REST API in API Gateway
2. Create a proxy integration to your Lambda function
3. Deploy the API to a stage
4. Your GraphQL endpoint will be available at:
   ```
   https://your-api-id.execute-api.region.amazonaws.com/stage-name
   ```

## Testing Locally

For local testing, you can use tools like:

- AWS SAM CLI with `sam local start-api`
- Serverless Offline plugin
- Lambda Test Events in AWS Console

## Security Considerations

1. **Token Management**: Store Databricks tokens in AWS Secrets Manager or Parameter Store
2. **API Authentication**: Add API Gateway authentication (API Keys, Cognito, or Lambda authorizers)
3. **SQL Injection**: The `executeQuery` resolver should be protected or removed in production
4. **Network**: Consider using VPC for Lambda if Databricks is in a private network
5. **IAM Roles**: Follow principle of least privilege for Lambda execution role

## Performance Tips

- Connection reuse: The Lambda function maintains a singleton Databricks connection across invocations
- Cold starts: Consider using Lambda provisioned concurrency for critical workloads
- Timeout: Set appropriate timeout values based on your query complexity
- Memory: Monitor and adjust Lambda memory allocation

## Monitoring

Monitor your Lambda function using:
- CloudWatch Logs for application logs
- CloudWatch Metrics for Lambda performance
- X-Ray for distributed tracing (add AWS X-Ray SDK)

## Troubleshooting

### Connection Errors
- Verify Databricks credentials are correct
- Check network connectivity (VPC settings if applicable)
- Ensure SQL Warehouse is running

### Timeout Errors
- Increase Lambda timeout setting
- Optimize Databricks queries
- Consider pagination for large datasets

### Memory Errors
- Increase Lambda memory allocation
- Limit result set sizes

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.