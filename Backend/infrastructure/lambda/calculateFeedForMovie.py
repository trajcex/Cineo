import os 
import boto3
import json
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
client = boto3.client('cognito-idp')

def handler(event, context):
    # print(event)
    
    try:
        body =  event['Records'][0]['dynamodb']
        new_image = body.get('NewImage')
        
        movie_table_name = os.environ['TABLE_NAME']
        feed_table_name = os.environ['FEED_TABLE_NAME']
        feed_weights_table_name = os.environ['FEED_WEIGHTS_TABLE_NAME']
        pool_id = os.environ['USER_POOL_ID']
        
        feed_table = dynamodb.Table(feed_table_name)
        feed_weights_table = dynamodb.Table(feed_weights_table_name)
        movie_table = dynamodb.Table(movie_table_name)
        
        params = {'UserPoolId': pool_id}
        
        response = client.list_users(**params)
        
        users = [
            next((i['Value'] for i in user['Attributes'] if i['Name'] == 'sub'), None)
            for user in response['Users']
        ]
        actors = new_image['actors']['S'].replace(' ', '').split(',')
        directors = new_image['directors']['S'].replace(' ', '').split(',')
        genres = new_image['genres']['S'].replace(' ', '').split(',')
        
        movie_id = new_image['id']['S']
        movie = actors + directors + genres

        for user_id in users:
            response = get_existing_item(user_id, feed_weights_table)
            if response and response != []:
                value = {item['type'].replace(" ",""):item['weight'] for item in response}
                ret = sum(value[i] if i in value else 0 for i in movie)
                add_weight(user_id,movie_id,ret,feed_table)

            else:
                add_weight(user_id,movie_id,0,feed_table)
        
        
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed: {str(e)}'
        }
        
def add_weight(user_id,movie_id,weight,table):
    print('user_id:', user_id, 'movie_id:', movie_id, 'weight:' ,weight)
    try:
        table.put_item(Item = {
        'userID': str(user_id),
        'movieID': str(movie_id),
        'weight': weight
        })
    except Exception as e:
        print(f"Error :, {str(e)}")
        
def get_existing_item(user_id, table):
    try:
        response = table.query(KeyConditionExpression=Key('userID').eq(user_id))
        
        return response.get('Items')
    except Exception as e:
        print(e)
        return None
