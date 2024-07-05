import boto3
import os


dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

def handler(event, context):

    print(event)