export const request = (tableName: string): string => `
#set ($site_pre = "SITE#")
#set ($view_pre = "VIEW#")
{
  "TableName": "${tableName}",
  "KeyConditionExpression": "PK = :pk",
  "ExpressionAttributeValues": {
      ":pk": {
        "S": "$site_pre$input.params('origin')"
      }
  }
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
{
  "views": [
    #foreach($elem in $inputRoot.Items) {
        "Url": "$elem.SK.S",
        "Count": "$elem.CountNr.N"
    }#if($foreach.hasNext),#end
    #end
  ]
}
`;