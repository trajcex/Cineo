import os
import json
import boto3
import jwt
from jwt import PyJWKClient

jwk_url = f'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_00KyVoKGx/.well-known/jwks.json'
jwk_client = PyJWKClient(jwk_url)

def verify_jwt(token):
    signing_key = jwk_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience="vg5mu7hl2qncb9blrf7aunp8r",
        options={"verify_exp": True}
    )

def handler(event, context):
    # print(f"event => {json.dumps(event)}")

    auth_token = event['authorizationToken']
    # auth_token = "eyJraWQiOiJOTXpZZXd6bUVNSklQXC9ENW85U25HSGprb3NQNFd0MFwvT1FwOGd5QWNiU2M9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIxMzU0YThjMi1iMGMxLTcwMmUtZTE4My1kYjY2NTA2YjY4MjIiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMjAyNC0wNy0xNyIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS1jZW50cmFsLTEuYW1hem9uYXdzLmNvbVwvZXUtY2VudHJhbC0xXzAwS3lWb0tHeCIsImNvZ25pdG86dXNlcm5hbWUiOiJuaWtvbGF0cmFqa292aWN2QGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJOaWtvbGEiLCJvcmlnaW5fanRpIjoiNGNjMDcxMjMtZDA5Yi00MzY2LWJkODAtNzUwOTIwZDg5YzZlIiwiYXVkIjoidmc1bXU3aGwycW5jYjlibHJmN2F1bnA4ciIsImV2ZW50X2lkIjoiOTBhOTBhY2YtNTNlNy00MmRhLTlkNzItMmI2MGEyNTg4NDcxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MjAwMjA1NDgsIm5pY2tuYW1lIjoidHJhamNleCIsImV4cCI6MTcyMDAyNDE0OCwiaWF0IjoxNzIwMDIwNTQ4LCJmYW1pbHlfbmFtZSI6IlRyYWprb3ZpYyIsImp0aSI6IjNiMGE2Mzk4LWFhZjgtNGViNi04OWM4LWEyY2Q4NDc4OTk1MyIsImVtYWlsIjoibmlrb2xhdHJhamtvdmljdkBnbWFpbC5jb20ifQ.hVhCavgyPwkdS6-oGO82ZQ2bjjU5r-XH-uJEcXYOWfjcqoXTma-3TKQ5ziHmu8zFHfd1OjDaJ9AOfA0rJ-Y8VR7s1zugNKxQ8oSMCaqL5QYNi_XxIhk8sLOLGXgVcKY3HOTbgaqx-9Xn304tI8ODk5cfl85Ntt1Jn0mu0kS6xM_y7Bm85Y6YpZfISiOd6rTkjMkrrrMgXgOkPfG7LcJJnugPmpRxG4k_GinXzq_YVGBdXxfdfzFnstepLqP0vsGeSjIe31pLXk3ip1n1toITl7p66MgH5tY_82DGl8GtK2Rli7lpo4LV9ol45yWApf2bnCYNCTU8HfR44GQHcpfg9g"

    try:
        decoded_jwt = verify_jwt(auth_token)
        print(decoded_jwt['cognito:groups'])

        # if 
        return {
            'principalId': decoded_jwt['sub'],
            'policyDocument': {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Action': 'execute-api:Invoke',
                        'Effect': 'Allow',
                        'Resource': event['methodArn'],
                    },
                ],
            },
            'context': {
                'user': decoded_jwt,
            },
        }
    except Exception as e:
        print(f"Token verification failed: {e}")

        return {
            'principalId': 'user',
            'policyDocument': {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Action': 'execute-api:Invoke',
                        'Effect': 'Deny',
                        'Resource': event['methodArn'],
                    },
                ],
            },
            'context': {
                'error': str(e),
            },
        }
        
event = {
    "authorizationToken": "Nesto",
    "methodArn": "arn:aws:execute-api:region:account-id:api-id/stage/verb/resource"
}
context = {}

# Call the handler function
response = handler(event, context)
# print(json.dumps(response, indent=2))
