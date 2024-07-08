
import json
import boto3
import os
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
sqs = boto3.client('sqs')


def handler(event, context):
    try:

        body = json.loads(event['body'])
        table_name = os.environ['TABLE_NAME']
        feed_table_name = os.environ['FEED_TABLE_NAME']
        userID = str(body['userID'])
        queue_url = os.environ['QUEUE_URL']


        topic_name = body['topic'].replace(" ","")+"Topic"
        email = body['email']

        try:
            topics = sns.list_topics()['Topics']
            topic = next((t for t in topics if t['TopicArn'].endswith(f':{topic_name}')), None)
            topic_arn = topic['TopicArn'] if topic else None
        except Exception as e:
            return {
                'statusCode': 500,
                'body': f'Error listing topics: {str(e)}'
            }
            
        try:
            response = sns.list_subscriptions_by_topic(TopicArn=topic_arn)
            subscriptions = response['Subscriptions']
            for sub in subscriptions:
                if sub['Protocol'] == 'email' and sub['Endpoint'] == email:
                    subscription_arn = sub['SubscriptionArn']
                    break
                
            if subscription_arn:
                try:
                    sns.unsubscribe(SubscriptionArn=subscription_arn)
                    print(f"Unsubscribed {email} from topic {topic_name}")
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'body': f'{email} is not unsubscribed to topic {topic_name} : {str(e)}'
                    }
            else:
                print(f"{email} is not unsubscribed to topic {topic_name}")
            
        except Exception as e:
            return {
                'statusCode': 500,
                'body': f'Error unsubscribing to topic: {str(e)}'
            }
        
        table = dynamodb.Table(table_name)
        feed_table = dynamodb.Table(feed_table_name)
        item = get_existing_item(body['userID'],table)
        
 
        input_data = [{
            'userID': str(body['userID']),
            'topic': str(body['topic']),
            'weight': -10
        }]
        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps({'inputForMap': input_data})
        )
       
        if item :
            return update_item(item,body,table)
        else:
            return {
                'statusCode': 500,
                'body': f'Item not found'
            }       

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
        return {
            'statusCode': 500,
            'body': json.dumps({'message': "Error getting item with id {}: {}".format(user_id, str(e))})
        }

    
    
def update_item(item,body,table):
    try:
        type = body['type']
        topic = body['topic']
        currentList = item[type]

        print(currentList)
        print(topic)
        if topic not in currentList:
            return {
                'statusCode': 400,
                'body': json.dumps('Topic not found in list.')
            }
        
        item[type].remove(topic)
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
        
        