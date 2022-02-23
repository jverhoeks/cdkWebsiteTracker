import {
  aws_apigateway as apigateway,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';


type DynamoDBIntegrationProps = {
  method: string;
  action: string;
  requestTemplate: string;
  responseTemplate: string;
  apiRole: iam.IRole;
  resource: apigateway.IResource;
  cors: {
    allowHeaders: string[];
    allowMethods: string[];
    allowCredentials: boolean;
    allowOrigins: string[];
  };
};

// Dynamodb Integration for API Gateway Rest API.
export class DynamoDBIntegration extends Construct {
  public readonly integration: apigateway.AwsIntegration;

  constructor(scope: Construct, id: string, props: DynamoDBIntegrationProps) {
    super(scope, id);


    this.integration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: props.action,
      options: {
        credentialsRole: props.apiRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': props.requestTemplate,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': props.responseTemplate,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': "'"+props.cors.allowHeaders.join(',')+"'",
              'method.response.header.Access-Control-Allow-Origin': "'"+props.cors.allowOrigins.join('')+"'",
              'method.response.header.Access-Control-Allow-Methods': "'"+props.cors.allowMethods.join(',')+"'",
            },
          },
        ],
      },
    });


    props.resource.addMethod(props.method, this.integration, {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        },
      }],
    });
  }
}

