import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        user_id = event['queryStringParameters']['userID']
        movi_table_name = os.environ['MOVIE_TABLE_NAME']
        feed_table_name = os.environ['FEED_TABLE_NAME']

        bucket_name = os.environ['BUCKET_NAME']
        s3_url_base = f"https://{bucket_name}.s3.amazonaws.com/"

        movie_table = dynamodb.Table(movi_table_name)
        feed_table =  dynamodb.Table(feed_table_name)
        
        feed = get_existing_items(user_id,feed_table)
        movies =  sorted(feed, key=lambda x: x["weight"], reverse=True)
        print(movies)
        response = movie_table.scan()

        items = response['Items']

        result = []
        for movie in movies:
            print(movie)
            item = next(filter(lambda x: x.get("id") == movie["movieID"], items), None)
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
def get_existing_items(user_id, table):
    try:
        response = table.query(
            KeyConditionExpression=Key('userID').eq(user_id)
        )
        return response.get('Items')
    except Exception as e:
        print(f"Error getting item with id {user_id}: {str(e)}")
        return None