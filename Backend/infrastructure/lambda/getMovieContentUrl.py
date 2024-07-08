import boto3
import os
import base64
import json
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']
        # queue_url = os.environ['QUEUE_URL']

        table_name = os.environ['TABLE_NAME']

        file_name = event['queryStringParameters']['file']
        # user_id = event['queryStringParameters']['userID']
        resolution = event['queryStringParameters']['resolution']
        movie_id = event['queryStringParameters']['id']
        # genres = event['queryStringParameters']['genres'].split(",")
        # genres = [genre.strip() for genre in genres]

        s3_object_path =  str(movie_id) + "-" +  f"{file_name}/{resolution}" + ".mp4"

        s3 = boto3.client('s3','eu-central-1')
        dynamodb = boto3.resource('dynamodb')
        
        table = dynamodb.Table(table_name)
        
        url = s3.generate_presigned_url(
            ClientMethod='get_object', 
            Params={
                'Bucket': bucket_name,
                'Key': s3_object_path
                }
            )

        response = table.query(
            KeyConditionExpression=Key('id').eq(movie_id)
        )

        items = response.get('Items')[0]
        return {
            'statusCode': 200,
            'body': json.dumps({
                'video_content':url,
                "description": str(items['description']),
                "directors":[str(items['directors'])],
                'actors':[str(items['actors'])],
                'genres':[str(items['genres'])],
                'title':str(items['title']),
                'fileName':str(items['fileName'])
            })
        }
    
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to generate presigned url. {str(e)}'
        }
