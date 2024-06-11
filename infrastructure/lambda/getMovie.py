import boto3
import os

def handler(event, context):
    bucket_name = os.environ['BUCKET_NAME']

    object_key = event['queryStringParameters']['file']

    s3 = boto3.client('s3')
    
    url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': object_key})
    
    return {
        'statusCode': 200,
        'body': url
    }