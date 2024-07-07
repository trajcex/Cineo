import boto3
import os
import json
from datetime import datetime

def handler(event, context):
    try:
        table_name = os.environ['TABLE_NAME']
        movie_id = event['queryStringParameters']['id']
        body = json.loads(event['body']).get('body')
        
        title = body.get('title',"")
        description = body.get('description',"")
        actors = parse_list_or_string(body.get('actors',[]))
        directors = parse_list_or_string(body.get('directors',[]))
        genres = parse_list_or_string(body.get('genres',[]))
        updatedAt = datetime.utcnow().isoformat()

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)

        table.update_item(
            Key={'id': movie_id},
            UpdateExpression="set title=:title, description=:description, genres=:genres, actors=:actors, directors=:directors, updatedAt=:updatedAt",
            ExpressionAttributeValues={":title": (str(title)), ":description": str(description), ":genres":str(genres), ":actors":str(actors), ":directors":str(directors), ":updatedAt":updatedAt},
            ReturnValues="UPDATED_NEW",
            )
        return {
            'statusCode': 200,
            'body': json.dumps('Video file changed successfully from S3 bucket.')
        }
    
    except Exception as e:
        print('Error Message', e)
        return {
            'statusCode': 500,
            'body': f'Failed to change video from S3 bucket. {str(e)}'
        }
        
def parse_list_or_string(value):
    if isinstance(value, list):
        return ', '.join(value)
    elif isinstance(value, str):
        return value