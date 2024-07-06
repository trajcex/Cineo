
import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')

def handler(event,context):
    try:
        
        print(event)
        table_name = os.environ['TABLE_NAME']
        table = dynamodb.Table(table_name)
        
        # body = json.loads(event['body']) 
        body = event['body']

        userID = body['userID']
        movieID = body['movieID']
        type = body['type']

        item = {
            'userID':userID,
            'movieID':movieID,
            'type':type
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
        }
        
        
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to subscribe on topic. {str(e)}'
        }