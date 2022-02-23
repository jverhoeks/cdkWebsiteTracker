import { Integer } from 'aws-sdk/clients/appstream';

export const request = (tableName: string, value:Integer): string => `
#set ($site_pre = "SITE#")
#set ($vote_pre = "VOTE#")
{ 
  "TableName": "${tableName}",
  "Key": {
    "PK": {
      "S": "$site_pre$input.params('origin')"
    },
    "SK": {
      "S": "$vote_pre$input.params('x-referer')"
    }
  },
  "UpdateExpression": "ADD CountNr :c",
  "ExpressionAttributeValues": {
      ":c": {
        "N": "${value}"
      }
    },
  "ReturnValues": "ALL_NEW"
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
#if(!$inputRoot.toString().contains("Attributes"))
#set($context.responseOverride.status = 404)
#set ($errorMessage = $input.path('$.message')))
{
  "message" : "$errorMessage"
}
#else
{
  "id": "$context.requestId",
  "PK": "$inputRoot.Attributes.PK.S",
  "SK": "$inputRoot.Attributes.SK.S",
  "Count": "$inputRoot.Attributes.CountNr.N"
}
#end
`;