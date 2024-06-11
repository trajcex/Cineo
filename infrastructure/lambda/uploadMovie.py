import json
import boto3
import os
import base64
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']
        table_name = os.environ['TABLE_NAME']
        
        
        file_content = base64.b64decode(event['body']['video_data'])
        file_name = event['body']['file_name']
        
        s3.put_object(Bucket=bucket_name, Key=file_name, Body=file_content)


        file_type = event['body'].get('file_type', 'unknown')
        file_size = int(len(file_content) // 4 * 3 // 1024)
        

        title = event['body'].get('title', '')
        description = event['body'].get('description', '')
        actors = event['body'].get('actors', [])
        directors = event['body'].get('directors', [])
        genres = event['body'].get('genres', [])
        
        metadata = {
            'fileName': file_name,
            'fileType': file_type,
            'fileSize': file_size,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'title': title,
            'description': description,
            'actors': actors,
            'directors': directors,
            'genres': genres
        }
        
        table = dynamodb.Table(table_name)
        table.put_item(Item=metadata)
        
        return {
            'statusCode': 200,
            'body': 'Video uploaded to S3 bucket successfully!'
        }
    except Exception as e:
        print('Error', e)
        return {
            'statusCode': 500,
            'body': f'Failed to upload video to S3 bucket. {str(e)}'
        }