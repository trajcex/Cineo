import boto3
import json
import os
from boto3.dynamodb.conditions import Key, Attr


dynamodb = boto3.resource('dynamodb')

def handler(event,context):
    try:
        
        
        table_name = os.environ['TABLE_NAME']
        table = dynamodb.Table(table_name)
                
        userID = event['queryStringParameters']['userID']
        movieID = event['queryStringParameters']['movieID']

        response = table.query(
                KeyConditionExpression=Key('userID').eq(userID) & Key('movieID').eq(movieID)
            )
        
        return{ 'type' : response['Items'][0]['type']}
        
        
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to subscribe on topic. {str(e)}'
            }