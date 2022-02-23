import {
  App,
  Stack,
  StackProps,
  CfnOutput,
  RemovalPolicy,
  aws_apigateway as apigateway,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBIntegration } from './lib/dynamoDBIntegration';
import * as logCreate from './templates/logCreate';
import * as viewsQuery from './templates/viewsQuery';
import * as viewUpdate from './templates/viewUpdate';
import * as voteCreate from './templates/voteCreate';
//import * as voteGet from './templates/voteGet';
//import * as votesList from './templates/votesList';
import * as votesQuery from './templates/votesQuery';
import * as voteUpdate from './templates/voteUpdate';

export class UsageTrackerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const corsHeaders = [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Referer',
      'X-Dimension',
      'X-Language',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
    ];
    const corsOrigin = '*';


    const table = new dynamodb.Table(this, 'VoteTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'powertoolsLayer', 'arn:aws:lambda:eu-west-1:017000801446:layer:AWSLambdaPowertoolsPython:9');

    // const VoteFN = new lambda.Function(this, 'Vote', {
    //   runtime: lambda.Runtime.PYTHON_3_9,
    //   layers: [powertoolsLayer],
    //   handler: 'vote.handler',
    //   code: lambda.Code.fromAsset('resources'),
    //   environment: {
    //     LOG_LEVEL: 'INFO',
    //     POWERTOOLS_LOGGER_SAMPLE_RATE: '0.1',
    //     POWERTOOLS_LOGGER_LOG_EVENT: 'true',
    //     POWERTOOLS_METRICS_NAMESPACE: 'Vote',
    //     POWERTOOLS_SERVICE_NAME: 'Vote-Tracker',
    //   },
    // });

    const corsPreflight = {
      allowHeaders: corsHeaders,
      allowMethods: ['OPTIONS', 'GET', 'POST'],
      allowCredentials: false,
      allowOrigins: [corsOrigin],
    };

    const api = new apigateway.RestApi(this, 'voteapi', {
      defaultCorsPreflightOptions: corsPreflight,
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true,
      },
      cloudWatchRole: true,
    });

    const resourceCors = { defaultCorsPreflightOptions: corsPreflight };

    const apiRole = new iam.Role(this, 'VoteAPIRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    table.grantReadWriteData(apiRole);

    const r_votes = api.root.addResource('votes', resourceCors);
    //const vote_id = votes.addResource('{id}', resourceCors);
    const r_vote = api.root.addResource('vote', resourceCors);
    const r_voteUp = r_vote.addResource('up', resourceCors);
    const r_voteDown = r_vote.addResource('down', resourceCors);
    const r_views = api.root.addResource('views', resourceCors);
    const r_view = api.root.addResource('view', resourceCors);
    const r_log = api.root.addResource('log', resourceCors);

    new DynamoDBIntegration(this, 'votesList', {
      method: 'GET',
      action: 'Query',
      requestTemplate: votesQuery.request(table.tableName),
      responseTemplate: votesQuery.response,
      apiRole: apiRole,
      resource: r_votes,
      cors: corsPreflight,
    });

    new DynamoDBIntegration(this, 'votesCreateIntegration', {
      method: 'POST',
      action: 'PutItem',
      requestTemplate: voteCreate.request(table.tableName),
      responseTemplate: voteCreate.response,
      apiRole: apiRole,
      resource: r_votes,
      cors: corsPreflight,
    });


    new DynamoDBIntegration(this, 'voteUpPostIntegration', {
      method: 'POST',
      action: 'UpdateItem',
      requestTemplate: voteUpdate.request(table.tableName, 1),
      responseTemplate: voteUpdate.response,
      apiRole: apiRole,
      resource: r_voteUp,
      cors: corsPreflight,
    });

    new DynamoDBIntegration(this, 'voteUpIntegration', {
      method: 'GET',
      action: 'UpdateItem',
      requestTemplate: voteUpdate.request(table.tableName, 1),
      responseTemplate: voteUpdate.response,
      apiRole: apiRole,
      resource: r_voteUp,
      cors: corsPreflight,
    });

    new DynamoDBIntegration(this, 'voteDownIntegration', {
      method: 'GET',
      action: 'UpdateItem',
      requestTemplate: voteUpdate.request(table.tableName, -1),
      responseTemplate: voteUpdate.response,
      apiRole: apiRole,
      resource: r_voteDown,
      cors: corsPreflight,
    });

    new DynamoDBIntegration(this, 'voteDownPostIntegration', {
      method: 'POST',
      action: 'UpdateItem',
      requestTemplate: voteUpdate.request(table.tableName, -1),
      responseTemplate: voteUpdate.response,
      apiRole: apiRole,
      resource: r_voteDown,
      cors: corsPreflight,
    });


    new DynamoDBIntegration(this, 'viewsListIntegration', {
      method: 'GET',
      action: 'Query',
      requestTemplate: viewsQuery.request(table.tableName),
      responseTemplate: viewsQuery.response,
      apiRole: apiRole,
      resource: r_views,
      cors: corsPreflight,
    });

    new DynamoDBIntegration(this, 'viewIntegration', {
      method: 'GET',
      action: 'UpdateItem',
      requestTemplate: viewUpdate.request(table.tableName),
      responseTemplate: viewUpdate.response,
      apiRole: apiRole,
      resource: r_view,
      cors: corsPreflight,
    });

    new DynamoDBIntegration(this, 'logIntegration', {
      method: 'GET',
      action: 'PutItem',
      requestTemplate: logCreate.request(table.tableName),
      responseTemplate: logCreate.response,
      apiRole: apiRole,
      resource: r_log,
      cors: corsPreflight,
    });

    // 👇 create an Output
    new CfnOutput(this, 'apiUrl', {
      value: api.url,
      description: 'api url',
      exportName: 'apiUrl',
    });
    new CfnOutput(this, 'table', {
      value: table.tableArn,
      description: 'table arn',
      exportName: 'tableArn',
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new UsageTrackerStack(app, 'usage-tracker-dev', { env: devEnv });
// new UsageTracker(app, 'usage-tracker-prod', { env: prodEnv });

app.synth();
