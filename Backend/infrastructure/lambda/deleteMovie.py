import boto3
import os

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']
        table_name = os.environ['TABLE_NAME']

        file_name = event['queryStringParameters']['file']
        resolution = event['queryStringParameters']['resolution'] + ".mp4"
        s3_object_path = f"{file_name}/{resolution}"

        s3 = boto3.client('s3')

        s3.delete_object(Bucket=bucket_name, Key=s3_object_path)

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)

        response = table.delete_item(
            Key={
                'fileName': file_name  
            }
        )
        return {
            'statusCode': 200,
            'body': f'Video file {file_name} deleted successfully from S3 bucket.'
        }
    
    except Exception as e:
        print('Error Message', e)
        return {
            'statusCode': 500,
            'body': f'Failed to delete video from S3 bucket. {str(e)}'
        }