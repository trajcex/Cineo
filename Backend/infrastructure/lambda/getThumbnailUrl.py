import json
import boto3
import os

s3 = boto3.client('s3')

def handler(event, context):
    try:
        query_params = event.get('queryStringParameters', {})
        file_name = query_params.get('fileName')
        movie_id = query_params.get('id')

        if not file_name or not movie_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Both fileName and id query parameters are required'})
            }

        bucket_name = os.environ['BUCKET_NAME']
        s3_url_base = f"https://{bucket_name}.s3.amazonaws.com/"
        s3_folder_path = f"{str(movie_id)}-{file_name}/"

        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_folder_path)
        if 'Contents' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'No objects found in S3 bucket'})
            }

        s3_object_path = None
        for obj in response['Contents']:
            key = obj['Key']
            if key.startswith(s3_folder_path) and key.endswith(('jpg', 'jpeg', 'png')):
                s3_object_path = key
                break

        if not s3_object_path:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'No valid thumbnail found'})
            }

        thumbnail_url = f"{s3_url_base}{s3_object_path}"

        return {
            'statusCode': 200,
            'body': json.dumps({'thumbnailUrl': thumbnail_url})
        }

    except Exception as e:
        print('Error Message:', e)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Failed to fetch thumbnail URL. {str(e)}'})
        }
