import boto3
import os
import json

sns = boto3.client('sns')

def handler(event, context):

    print(event)
    body = event['Records'][0]['dynamodb']['NewImage']
    movie_name = body['fileName']['S']
    topic_list_for_send=[]
    topic_list_for_send.extend(body['actors']['S'].replace(" ","").split(","))
    topic_list_for_send.extend(body['genres']['S'].replace(" ","").split(","))
    topic_list_for_send.extend(body['directors']['S'].replace(" ","").split(","))

    print(topic_list_for_send)
    
    try:
        response = sns.list_topics()
        topics = response['Topics']
        topic_names = {topic['TopicArn'].split(':')[-1].replace('Topic', ''): topic['TopicArn'] for topic in topics}
        
        for topic in topic_list_for_send:
            if topic in topic_names:
                print(topic_names[topic])
                try:
                    message = f"Pretplaćeni ste na obaveštenja o {topic}. Upravo smo dodali novi film {movie_name}! Pogledajte ga i uživajte!"

                    subject = "Novi film koji bi vam se mogao dopasti!"

                    sns.publish(
                        TopicArn=topic_names[topic],
                        Message=message,
                        Subject= subject
                    )
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'body': json.dumps(str(e))
                    }
        
        return {
            'statusCode': 200,
            'body': json.dumps('Success')
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }