import json
import boto3
import os
import base64
from datetime import datetime
import uuid
import io
import imghdr

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

def handler(event, context):
    try:

        body = event['body']
        body = json.loads(body)

        bucket_name = os.environ['BUCKET_NAME']
        table_name = os.environ['TABLE_NAME']
        queue_url = os.environ['QUEUE_URL']

        file_content = base64.b64decode(body['video_data'])
        thumbnail = base64.b64decode(body['thumbnail'])

        file_name = body['file_name']
        movie_id = uuid.uuid4()
        
        resolution = body.get('resolution', '')

        s3_folder_path =  str(movie_id) + "-" +  f"{file_name}/"
        s3_object_path_video =  s3_folder_path  + "file.mp4"
        s3_object_path_photo =  s3_folder_path + "thumbnail." + get_image_format(thumbnail)

        s3.put_object(
            Bucket=bucket_name,
            Key=s3_object_path_video, 
            Body=file_content,
            ContentType='video/mp4')
        
        s3.put_object(Bucket=bucket_name, 
            Key=s3_object_path_photo, 
            Body=thumbnail)    

        file_type = 'video/mp4'
        file_size = int(len(file_content) // 4 * 3 // 1024)
        
        title = body.get('title', '')
        description = body.get('description', '')
        actors = parse_list_or_string(body.get('actors', []))
        directors = parse_list_or_string(body.get('directors', []))
        genres = parse_list_or_string(body.get('genres', []))

        
        metadata = {
            'id': str(movie_id),
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


        resolutions = ['144','360','480','720']
            
        input_data = [{
            'id': str(movie_id),
            'fileName': file_name,
            'resolution': res,
            'resolutionBase': resolution
        } for res in resolutions]

        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps({'inputForMap': input_data})
        )

        return {
            'statusCode': 200,
            'body': 'Video uploaded to S3 bucket successfully!'
        }
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to upload video to S3 bucket. {str(e)}'
        }
    
def parse_list_or_string(value):
    if isinstance(value, list):
        return ', '.join(value)
    elif isinstance(value, str):
        return value
    
def get_image_format(image_data):
    image_stream = io.BytesIO(image_data)
    image_format = imghdr.what(image_stream)
    return str(image_format)