# replace this



Views
/view  host / page / counter  -> return value

##

Votes 
/vote/up    host / page / value  -> return value 
/vote/down  host / page / value  -> return value

Logs

host / page / datetime / source ip / useragent / dimension / language 


SITE#jacob.verhoeks.org VIEW#https://jacob.verhoeks.org/test.html 1000
SITE#jacob.verhoeks.org VIEW#https://jacob.verhoeks.org/about.html 200
SITE#jacob.verhoeks.org VOTE#https://jacob.verhoeks.org/about.html 4 
SITE#jacob.verhoeks.org VOTE#https://jacob.verhoeks.org/test.html 3
LOG#https://jacob.verhoeks.org/test.html DATE  { data }


aws dynamodb update-item \
    --table-name Test \
    --key '{"Host": { "S": "jacob.verhoeks.org" }, "Url": { "S": "/test"}}' \
    --update-expression "SET ViewCount = ViewCount + :incr" \
    --expression-attribute-values '{":incr":{"N":"1"}}' \
    --return-values UPDATED_NEW
