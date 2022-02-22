export const request = (tableName: string): string => `
{ 
  "TableName": "${tableName}",
  "Item": {
    "Host": {
      "S": "$context.requestId"
    },
    "Page": {
      "S": "$context.domainName"
    },
    "Count": {
        "N": "1"
    },
    "SourceIP": {
        "S": "$context.identity.sourceIp"
    },
    "UserAgent": {
        "S": "$context.identity.userAgent"
    },
    "OriginHost" : {
        "S": "$input.params('origin')"
    },
    "RefererPage" : {
        "S": "$input.params('x-referer')"
    }
  }
}
`;

export const response = `
{
  "id": "$context.requestId"
}
`;