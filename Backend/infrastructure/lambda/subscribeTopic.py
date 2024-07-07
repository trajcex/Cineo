
import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

def handler(event, context):
    try:

        body = json.loads(event['body'])

        table_name = os.environ['TABLE_NAME']
        feed_table_name = os.environ['FEED_TABLE_NAME']

        topic_name = body['topic'].replace(" ","")+"Topic"
        
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
            raise {
                'statusCode': 500,
                'body': f'Error subscribing to topic: {str(e)}'
            }
        
        table = dynamodb.Table(table_name)
        feed_table = dynamodb.Table(feed_table_name)

        item = get_existing_item(body['userID'],table)
        feed_item = get_existing_item_feed(body['userID'], body['topic'], feed_table)
        
        if feed_item:
            response = table.update_item(
                Key={
                    'userID': str(body['userID']),
                    'type': str(body['topic'])
                },
                UpdateExpression="add weight :inc",
                ExpressionAttributeValues={
                    ':inc': 1
                },
                ReturnValues="UPDATED_NEW"
            )
        else:
            feed_table.put_item(Item = {
            'userID': body['userID'],
            'type': body['topic'],
            'weight': 10
            })

        if item :
            return update_item(item,body,table, feed_table_name)
        else:
            return add_item(body,table, feed_table_name)       


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
    
def get_existing_item_feed(user_id, topic, table):
    try:
        response = table.query(KeyConditionExpression=Key("userID").eq(user_id) & Key('type').eq(topic))
        return response.get('Items')[0]
    except Exception as e:
        print(f"Error getting item with id {user_id}: {str(e)}")
        return None
        
def update_item(item,body,table, feed_table):
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
        
        
def add_item(body,table, feed_table):
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
    