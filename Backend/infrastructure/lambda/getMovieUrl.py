import boto3
import os
import base64

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']

        file_name = event['queryStringParameters']['file']

        s3 = boto3.client('s3')
        
        url = s3.generate_presigned_url(
            ClientMethod='get_object', 
            Params={
                'Bucket': bucket_name,
                'Key': file_name
                }
            )
        
        return {
            'statusCode': 200,
            'body': url
            }
    
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to generate presigned url. {str(e)}'
        }