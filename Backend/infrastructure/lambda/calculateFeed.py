import boto3
import os
import base64
import json
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        body =  event['Records'][0]['dynamodb']
        new_image = body.get('NewImage')
                
        feed_weights_table_name = os.environ['FEED_WEIGHTS_TABLE_NAME']
        movie_table_name = os.environ['TABLE_NAME']
        feed_table_name = os.environ['FEED_TABLE_NAME']
        
        feed_table = dynamodb.Table(feed_table_name)
        feed_weights_table = dynamodb.Table(feed_weights_table_name)
        movie_table = dynamodb.Table(movie_table_name)

        response = movie_table.scan()
        response = response['Items']
        
        parse_data = {item['id']: item['actors'].replace(' ','').split(',') + item['directors'].replace(' ','').split(',')+ item['genres'].replace(' ','').split(',') for item in response}
        print(parse_data)  
        
        user_id = new_image.get('userID')['S']
        
        response = get_existing_item(user_id, feed_weights_table)
        value = {item['type']:item['weight'] for item in response} 
        print(value) 
        
        add_weight(feed_table, user_id,parse_data,value)

        return {
            'statusCode': 200,
            'body': json.dumps('Uspesno ste upisali u feed dynamo!')
        }
    
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to generate presigned url. {str(e)}'
        }

def add_weight(table, user_id,parse_data,value):
    
    try:
        for item in parse_data:
            ret = sum(value[i] for i in parse_data[item] if i in value)
            
            print (item," : ",ret)
            
            table.put_item(Item = {
            'userID': str(user_id),
            'movieID': str(item),
            'weight': ret
            })
    except Exception as e:
        print(f"Error getting item, with id {user_id}: {str(e)}")
        
def get_existing_item(user_id, table):
    try:
        response = table.query(
            KeyConditionExpression=Key('userID').eq(user_id)
        )
        return response.get('Items')
    except Exception as e:
        print(f"Error getting item with id {user_id}: {str(e)}")
        return None
    
