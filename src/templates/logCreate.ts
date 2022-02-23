export const request = (tableName: string): string => `
#set ($site_pre = "LOG#")
{ 
  "TableName": "${tableName}",
  "Item": {
    "PK": {
      "S": "$site_pre$input.params('origin')"
    },
    "SK": {
      "S": "$context.requestTime"
    },
    "SourceIP": {
        "S": "$context.identity.sourceIp"
    },
    "UserAgent": {
        "S": "$context.identity.userAgent"
    },
    "Dimension": {
      "S": "$input.params('x-dimension')"
    },
    "OriginHost" : {
        "S": "$input.params('origin')"
    },
    "Language" : {
      "S": "$input.params('x-language')"
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