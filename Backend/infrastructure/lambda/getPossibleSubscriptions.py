
import os
import boto3
import json

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:

        table_name = os.environ['TABLE_NAME']
        
        table = dynamodb.Table(table_name)
        response = table.scan()
        print(response['Items'])
        actors = {}
        directors = {}
        genres = {}
        for item in response['Items']:
            
            actor_value = item.get('actors', []).split(',') 
            actors.update({value.strip():'' for value in actor_value})
            
            director_value = item.get('directors', []).split(',') 
            directors.update({value.strip():'' for value in director_value})
            
            genre_value = item.get('genres', []).split(',') 
            genres.update({value.strip():'' for value in genre_value})
            
        category ={
            'actors': list(actors.keys()),
            'directors': list(directors.keys()),
            'genres': list(genres.keys())
        }
        return{
            'statusCode': 200,
            'body': json.dumps(category)
        }
    
    except Exception as e:
        print('Error Messaaage', e)
        return {
            'statusCode': 500,
            'body': f'Errror Messaaage. {str(e)}'
        }