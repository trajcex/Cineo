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
        queue_url = os.environ['QUEUE_URL']


        file_name = event['queryStringParameters']['file']
        user_id = event['queryStringParameters']['userID']
        resolution = event['queryStringParameters']['resolution']
        movie_id = event['queryStringParameters']['id']
        genres = event['queryStringParameters']['genres'].split(",")
        genres = [genre.strip() for genre in genres]

        input_data = [{
            'userID': str(user_id),
            'topic': topic,
            'weight': 5
        } for topic in genres]
        
        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps({'inputForMap': input_data})
        )

        s3_object_path =  str(movie_id) + "-" +  f"{file_name}/{resolution}" + ".mp4"

        s3 = boto3.client('s3','eu-central-1')
        
        url = s3.generate_presigned_url(
            ClientMethod='get_object', 
            Params={
                'Bucket': bucket_name,
                'Key': s3_object_path,
                'ResponseContentDisposition': 'attachment'
                }
            )


        return {
            'statusCode': 200,
            'body': json.dumps({
                'video_content':url
            })
        }
    
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to generate presigned url. {str(e)}'
        }
