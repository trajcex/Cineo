
import json
import boto3
import os
import ast
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')


def handler(event,context):
    try:
        
        table_name = os.environ['TABLE_NAME']
        queue_url = os.environ['QUEUE_URL']

        table = dynamodb.Table(table_name)
        feed_table_name = os.environ['FEED_TABLE_NAME']
        feed_table = dynamodb.Table(feed_table_name)
    
        
        body = json.loads(event['body']) 
        
        userID = body['userID']
        movieID = body['movieID']
        type = body['type']
        genres = body['genres'][0].split(",")
        genres = [genre.strip() for genre in genres]
        

        input_data = [{
            'userID': str(userID),
            'topic': topic,
            'weight': 0
        } for topic in genres]

        for item in input_data:
            if(type == 'love'):
                item['weight'] = 3
            elif(str(type) == 'like'):
                item['weight'] = 1
            elif(str(type) == 'none'):
                item['weight'] = -1
            elif(str(type) == 'dislike'):
                item['weight'] = -1

        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps({'inputForMap': input_data})
        )
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
        