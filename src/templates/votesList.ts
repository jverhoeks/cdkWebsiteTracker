export const request = (tableName: string): string => `
{
  "TableName": "${tableName}"
}
`;

export const response = `
#set($inputRoot = $input.path('$'))
{
  "votes": [
    #foreach($elem in $inputRoot.Items) {
        "Host": "$elem.Host.S",
        "Page": "$elem.Page.S",
        "Count": "$elem.Count.N",
    }#if($foreach.hasNext),#end
    #end
  ]
}
`;