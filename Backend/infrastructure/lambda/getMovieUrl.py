import boto3
import os
import base64
import json

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']

        file_name = event['queryStringParameters']['file']
        resolution = event['queryStringParameters']['resolution']
        movie_id = event['queryStringParameters']['id']

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