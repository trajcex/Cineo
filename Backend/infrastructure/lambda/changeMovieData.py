import boto3
import os
import json
from datetime import datetime
import base64
import io
import imghdr

s3 = boto3.client('s3')

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
        thumbnail_base64 = body.get('thumbnailBase64', "")
        file_name = body.get('fileName', "")

        if thumbnail_base64:
            thumbnail_data = base64.b64decode(thumbnail_base64)
            s3_folder_path =  str(movie_id) + "-" +  f"{file_name}/"
            new_s3_object_key_photo = s3_folder_path + "thumbnail."

            old_image_key = get_old_image_key(movie_id, file_name)
            if old_image_key:
                old_image_data = s3.get_object(Bucket=os.environ['BUCKET_NAME'], Key=old_image_key)
                old_image_format = get_image_format(old_image_data['Body'].read())

                new_image_format = get_image_format(base64.b64decode(thumbnail_base64))
                new_s3_object_key_photo += new_image_format

                if old_image_format == new_image_format:
                    s3.put_object(
                        Bucket=os.environ['BUCKET_NAME'],
                        Key=new_s3_object_key_photo,
                        Body=base64.b64decode(thumbnail_base64)
                    )
                else:
                    s3.delete_object(
                        Bucket=os.environ['BUCKET_NAME'],
                        Key=old_image_key
                    )

                    new_s3_object_key_photo += new_image_format
                    s3.put_object(
                        Bucket=os.environ['BUCKET_NAME'],
                        Key=new_s3_object_key_photo,
                        Body=base64.b64decode(thumbnail_base64)
                    )

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

def get_image_format(image_data):
    image_stream = io.BytesIO(image_data)
    image_format = imghdr.what(image_stream)
    return str(image_format)

def get_old_image_key(movie_id, file_name):
    try:
        response = s3.list_objects_v2(Bucket=os.environ['BUCKET_NAME'], Prefix=f"{movie_id}-{file_name}/thumbnail")
        if 'Contents' in response:
            for obj in response['Contents']:
                image_data = s3.get_object(Bucket=os.environ['BUCKET_NAME'], Key=obj['Key'])
                image_format = get_image_format(image_data['Body'].read())
                if image_format:
                    return obj['Key']
    except Exception as e:
        print(f"Error fetching old image key: {e}")
    
    return None