""" tracer """
import base64 
import json
import os
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.event_handler.api_gateway import ApiGatewayResolver, ProxyEventType,CORSConfig,Response

tracer = Tracer()
logger = Logger()


cors_allow_origin = os.environ.get('CORS_ALLOW_ORIGIN','*')

cors_config = CORSConfig(allow_origin=cors_allow_origin, max_age=300)
app = ApiGatewayResolver(proxy_type=ProxyEventType.APIGatewayProxyEvent,cors=cors_config)


# @app.exception_handler(ValueError)
# def handle_value_error(ex: ValueError):
#     metadata = {"path": app.current_event.path}
#     logger.error(f"Malformed request: {ex}", extra=metadata)

#     return Response(
#         status_code=400,
#         # content_type=content_types.TEXT_PLAIN,        
#         content_type='text/plain',
#         body="Invalid request",
#     )

@app.get(".+")
def catch_any_route_after_any():
    return {"path_received": app.current_event.path}

@app.get("/vote")
@tracer.capture_method
def get_hello_universe():
    return {"message": "hello universe"}

# Only POST HTTP requests to the path /hello will route to this function
@app.post("/vote")
@tracer.capture_method
def get_hello_you():
    # name = app.current_event.json_body.get("name")
    name = "post"
    return {"message": f"hello {name}"}

# You can continue to use other utilities just as before
@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
def handler(event, context):
    return app.resolve(event, context)

# def handler(event, context): 
#     #print(json.dumps(event,indent=2))
#     print(event)
#     del(context)

#     body = event.get('body','empty') if not event.get('isBase64Encoded',False) else base64.b64decode(event.get('body',''))
#     #respond(None,f"size: {len(body)}")
#     return { "test": len(body)}
    

# ## Testing 
if __name__ == "__main__":
    event_str = '{"version": "2.0", "routeKey": "ANY /trace", "rawPath": "/trace", "rawQueryString": "", "headers": {"accept": "*/*", "content-length": "16", "content-type": "application/x-www-form-urlencoded", "host": "hkjrqhfytj.execute-api.eu-west-1.amazonaws.com", "user-agent": "curl/7.77.0", "x-amzn-trace-id": "Root=1-61feadb2-6566642a719dd356283eebf2", "x-forwarded-for": "85.144.44.7", "x-forwarded-port": "443", "x-forwarded-proto": "https"}, "requestContext": {"accountId": "536808805206", "apiId": "f0ie76qylb", "domainName": "f0ie76qylb.execute-api.eu-west-1.amazonaws.com", "domainPrefix": "f0ie76qylb", "http": {"method": "POST", "path": "/trace", "protocol": "HTTP/1.1", "sourceIp": "85.144.44.7", "userAgent": "curl/7.77.0"}, "requestId": "NFAT6hxvDoEEMIA=", "routeKey": "ANY /trace", "stage": "$default", "time": "05/Feb/2022:17:02:42 +0000", "timeEpoch": 1644080562465}, "body": "eyd0ZXN0JzogJ2RhdGEnfQ==", "isBase64Encoded": "True"}'

    class Context:
        def __init__(self,function_name):
            self.function_name = function_name 
            self.memory_limit_in_mb = "128"
            self.invoked_function_arn = "test"
            self.aws_request_id = "test"
        
    print(handler(json.loads(event_str),Context("test")))



#https://awslabs.github.io/aws-lambda-powertools-python/latest/core/event_handler/api_gateway/