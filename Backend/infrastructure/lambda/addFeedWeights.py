import boto3
import os
import base64
import json
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        feed_table_name = os.environ['FEED_TABLE_NAME']
        feed_table = dynamodb.Table(feed_table_name)

        user_id = event.get('userID')
        topic = event.get('topic')
        weight = event.get('weight') 
        
        add_weight(feed_table, user_id, topic, weight)

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

def add_weight(table, user_id, topic, weight):
    feed_item = get_existing_item_feed(user_id, topic, table)
    try:
        if feed_item:
            response = table.update_item(
                Key={
                    'userID': str(user_id),
                    'type': str(topic)
                },
                UpdateExpression="ADD weight :inc",
                ExpressionAttributeValues={
                    ':inc': weight
                },
                ReturnValues="UPDATED_NEW"
            )
        else:
            table.put_item(Item = {
            'userID': str(user_id),
            'type': str(topic),
            'weight': weight
            })
    except Exception as e:
        print(f"Error getting item, with id {user_id}: {str(e)}")
        
def get_existing_item_feed(user_id, topic, table):
    try:
        response = table.query(
            KeyConditionExpression=Key('userID').eq(user_id) & Key('type').eq(topic)
        )
        return response.get('Items')[0]
    except Exception as e:
        print(f"Error getting item with id {user_id}: {str(e)}")
        return None