import json
import boto3
from boto3.dynamodb.conditions import Key
import os

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
                'body': {'error': 'No query parameters found'}
            }

        search_type = query_params.get('search_type')
        search_value = query_params.get('search_value')

        if not search_type or not search_value:
            return {
                'statusCode': 400,
                'body': {'error': 'Missing search_type or search_value parameter'}
            }

        if search_type not in index_mapping:
            return {
                'statusCode': 400,
                'body': {'error': 'Invalid search_type parameter'}
            }

        table_name = os.environ['TABLE_NAME']
        table = dynamodb.Table(table_name)
        
        index_name = index_mapping[search_type]
        key_name = search_type
        
        response = table.query(
            IndexName=index_name,
            KeyConditionExpression=Key(key_name).eq(search_value)
        )
        
        return {
            'statusCode': 200,
            'body': str(response['Items'])
        }
        
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': {'error': 'Internal server error', 'message': str(e)}
        }
