import boto3
import os
import uuid

def handler(event, context):
    bucket_name = os.environ['BUCKET_NAME']

    file_name = event['queryStringParameters']['file']
    resolution = event['queryStringParameters']['resolution']
    movie_id = uuid.uuid4()
    s3_object_path =  str(movie_id) + "-" +  f"{file_name}/{resolution}" + ".mp4"
    
    s3 = boto3.client('s3','eu-central-1')
    
    expiration = 3600
    response = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': bucket_name, 'Key': s3_object_path, 'ContentType': 'video/mp4'},
            ExpiresIn=expiration
        )
    
    return {
        'statusCode': 200,
        'body': response
    }