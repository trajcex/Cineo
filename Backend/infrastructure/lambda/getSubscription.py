
import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:

        body = event['body']
        table_name = os.environ['TABLE_NAME']
        
        table = dynamodb.Table(table_name)
        item = get_existing_item(body['userID'],table)
        
        return {
            'actors': item['actors'],
            'directors': item['directors'],
            'genres': item['genres']
            }
          

    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to subscribe on topic. {str(e)}'
        }
    
def get_existing_item(user_id,table):
    try:
        response = table.query(KeyConditionExpression=Key("userID").eq(user_id))
        return response.get('Items')[0]
    except Exception as e:
        print(f"Error getting item with id {user_id}: {str(e)}")
        return None
    
    