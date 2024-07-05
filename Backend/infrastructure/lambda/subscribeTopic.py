
import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

def handler(event, context):
    try:

        body = event['body']
        table_name = os.environ['TABLE_NAME']
        topic_name = body['topic']
        
        try:
            topics = sns.list_topics()['Topics']
            topic = next((t for t in topics if t['TopicArn'].endswith(f':{topic_name}')), None)
            topic_arn = topic['TopicArn'] if topic else None
        except Exception as e:
            return {
            'statusCode': 500,
            'body': f'Error listing topics: {str(e)}'
            }
        
        if not topic_arn:
            try:
                create_topic_response = sns.create_topic(Name=topic_name)
                topic_arn = create_topic_response['TopicArn']
            except Exception as e:
                return {
                    'statusCode': 500,
                    'body': f'Error creating topic: {str(e)}'
                }
        
        try:
            sns.subscribe(
                TopicArn=topic_arn,
                Protocol='email',
                Endpoint=body['email']
            )
            print(f"Subscribed {body['email']} to topic {topic_name}")
        except Exception as e:
            print(f"Error subscribing to topic: {e}")
            raise e
        
        table = dynamodb.Table(table_name)
        item = get_existing_item(body['userID'],table)
        
        if item :
            return update_item(item,body,table)
        else:
            return add_item(body,table)        

    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Failed to subscribe on topic. {str(e)}'
        }
    
def get_existing_item(user_id,table):
    try:
        response = table.query(KeyConditionExpression=Key("userID").eq(user_id))
        return response.get('Items')[0]
    except Exception as e:
        print(f"Error getting item with id {user_id}: {str(e)}")
        return None
    
    
def update_item(item,body,table):
    try:
        type = body['type']
        topic = body['topic']
        item[type].append(topic)
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item updated successfully', 'item': item})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error updating item', 'error': str(e)})
        }
        
        
def add_item(body,table):
    try:
        data = {
            'actors': [],
            'directors': [],
            'genres': []
        }

        if 'type' in body and 'topic' in body:
            topic_type = body['type']
            topic_value = body['topic']

            if topic_type in data:
                data[topic_type].append(topic_value)
        item = {
            'userID': body['userID'],
            'email': body['email'],
            'actors': data['actors'],
            'directors': data['directors'],
            'genres': data['genres']
        }
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item added successfully', 'item': item})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error adding item', 'error': str(e)})
        }        
    