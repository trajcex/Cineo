import json
import boto3
import os

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        movi_table_name = os.environ['MOVIE_TABLE_NAME']

        bucket_name = os.environ['BUCKET_NAME']
        s3_url_base = f"https://{bucket_name}.s3.amazonaws.com/"

        table = dynamodb.Table(movi_table_name)
        response = table.scan()

        items = response['Items']

        result = []
        for item in items:
            movie_id = item['id']
            title = item['title']
            file_name = item['fileName']

            s3_folder_path = f"{str(movie_id)}-{file_name}/"
            s3_object_path = None  
            
            response = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_folder_path)
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    print(f'Checking key: {key}') 
                    if key.startswith(s3_folder_path) and key.endswith(('jpg', 'jpeg', 'png')):
                        s3_object_path = key
                        print(f'Valid object found: {s3_object_path}')  
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
        print('Error Message:', e)
        return {
            'statusCode': 500,
            'body': f'Failed to fetch data from DynamoDB. {str(e)}'
        }
