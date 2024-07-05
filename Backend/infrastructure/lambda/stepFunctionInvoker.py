import json
import boto3
import os

stepfunctions = boto3.client('stepfunctions')

def handler(event, context):
    state_machine_arn = os.environ['STATE_MACHINE_ARN']
    
    for record in event['Records']:
        message_body = json.loads(record['body'])

        stepfunctions.start_execution(
            stateMachineArn=state_machine_arn,
            input=json.dumps(message_body)
        )
    return {
        'statusCode': 200,
        'body': 'Step Function started'
    }