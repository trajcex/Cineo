import json
import boto3
from boto3.dynamodb.conditions import Key
import os

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

index_mapping = {
    'title': 'GSI1',
    'actors': 'GSI2',
    'directors': 'GSI3',
    'genres': 'GSI4',
    'description': 'GSI5'
}

def handler(event, context):
    try:
        query_params = event.get('queryStringParameters')
        if not query_params:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No query parameters found'})
            }

        search_type = query_params.get('search_type')
        search_value = query_params.get('search_value')

        if not search_type or not search_value:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing search_type or search_value parameter'})
            }

        if search_type not in index_mapping:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid search_type parameter'})
            }

        table_name = os.environ['TABLE_NAME']
        bucket_name = os.environ['BUCKET_NAME']
        s3_url_base = f"https://{bucket_name}.s3.amazonaws.com/"

        table = dynamodb.Table(table_name)
        index_name = index_mapping[search_type]
        key_name = search_type

        response = table.query(
            IndexName=index_name,
            KeyConditionExpression=Key(key_name).eq(search_value)
        )

        items = response['Items']
        result = []

        for item in items:
            movie_id = item['id']
            title = item['title']
            file_name = item['fileName']

            s3_folder_path = f"{str(movie_id)}-{file_name}/"
            s3_object_path = None

            s3_response = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_folder_path)
            if 'Contents' in s3_response:
                for obj in s3_response['Contents']:
                    key = obj['Key']
                    if key.startswith(s3_folder_path) and key.endswith(('jpg', 'jpeg', 'png')):
                        s3_object_path = key
                        break

            if s3_object_path:
                item_result = {
                    'id': movie_id,
                    'title': title,
                    'fileName': file_name,
                    'thumbnailUrl': f"{s3_url_base}{s3_object_path}"
                }
                result.append(item_result)
            else:
                print(f'No valid object found in folder {s3_folder_path}')

        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error', 'message': str(e)})
        }
