import boto3
import os
import base64

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']

        file_name = event['queryStringParameters']['file']
        resolution = event['queryStringParameters']['resolution']
        movie_id = event['queryStringParameters']['id']

        s3_object_path =  str(movie_id) + "-" +  f"{file_name}/{resolution}" + ".mp4"

        s3 = boto3.client('s3')
        
        response = s3.get_object(Bucket=bucket_name, Key= s3_object_path)
        video_content = response['Body'].read()
        video_content = base64.b64encode(video_content).decode()

        return {
            'statusCode': 200,
            'headers': {
                    'Content-Type': 'video/mp4',
                    'Content-Disposition': f'attachment; filename="{file_name}"'
                },
                'body': video_content,
                'isBase64Encoded': True
            }
    
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to download video from S3 bucket. {str(e)}'
        }