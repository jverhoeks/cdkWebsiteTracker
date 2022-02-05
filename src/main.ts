//import { ApiGatewayToLambda } from '@aws-solutions-constructs/aws-apigateway-lambda';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class UsageTrackerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const UserTrackerFN = new lambda.Function(this, 'UsageTracker', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'tracer.handler',
      code: lambda.Code.fromAsset('resources'),
    });

    const userTrackerIntegration = new HttpLambdaIntegration('userTrackerIntegration', UserTrackerFN);

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi');

    httpApi.addRoutes({
      path: '/trace',
      methods: [apigwv2.HttpMethod.GET],
      integration: userTrackerIntegration,
    });

    // // define resources here...
    // new ApiGatewayToLambda(this, 'ApiGatewayToLambdaPattern', {
    //   lambdaFunctionProps: {
    //     runtime: lambda.Runtime.PYTHON_3_9,
    //     handler: 'tracer.handler',
    //     code: lambda.Code.fromAsset('resources'),
    //   },
    // });
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