import boto3
import os
import json

def handler(event, context):
    try:
        bucket_name = os.environ['BUCKET_NAME']
        table_name = os.environ['TABLE_NAME']

        file_name = event['queryStringParameters']['file']
        movie_id = event['queryStringParameters']['id']

        s3_object_path = str(movie_id) + "-" +  f"{file_name}"

        s3 = boto3.client('s3')

        objects_to_delete = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_object_path)

        if 'Contents' in objects_to_delete:
            delete_keys = {'Objects': [{'Key': obj['Key']} for obj in objects_to_delete['Contents']]}
            s3.delete_objects(Bucket=bucket_name, Delete=delete_keys)

        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)

        table.delete_item(
            Key={
                'id':movie_id  
            }
        )
        return {
            'statusCode': 200,
            'body': json.dumps('Video file deleted successfully from S3 bucket.')
        }
    
    except Exception as e:
        print('Error Message', e)
        return {
            'statusCode': 500,
            'body': f'Failed to delete video from S3 bucket. {str(e)}'
        }