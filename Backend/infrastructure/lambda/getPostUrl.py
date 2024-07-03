import boto3
import os

def handler(event, context):
    bucket_name = os.environ['BUCKET_NAME']

    file_name = event['queryStringParameters']['file']

    s3 = boto3.client('s3')
    expiration = 3600
    response = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': bucket_name, 'Key': file_name, 'ContentType': 'video/mp4'},
            ExpiresIn=expiration
        )
    
    return {
        'statusCode': 200,
        'body': response
    }