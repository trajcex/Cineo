import boto3
import os
import base64
import json
from boto3.dynamodb.conditions import Key


def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']
        table_name = os.environ['TABLE_NAME']


        file_name = event['queryStringParameters']['file']
        resolution = event['queryStringParameters']['resolution']
        movie_id = event['queryStringParameters']['id']
        
        s3_object_path =  str(movie_id) + "-" +  f"{file_name}/{resolution}" + ".mp4"
        
        s3 = boto3.client('s3')
        dynamodb = boto3.resource('dynamodb')
        
        table = dynamodb.Table(table_name)
        
        response = s3.get_object(Bucket=bucket_name, Key= s3_object_path)
        video_content = response['Body'].read()
        video_content = base64.b64encode(video_content)
        
        response = table.query(
            KeyConditionExpression=Key('id').eq(movie_id)
        )
        items = response.get('Items')[0]   
        
        return {
            'statusCode': 200,
                'body': json.dumps({
                    "video_content":str(video_content),
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
            'body': f'Failed to load video from S3 bucket. {str(e)}'
        }