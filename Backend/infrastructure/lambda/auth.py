import os
import json
import boto3
# from jwt import PyJWKClient



# jwk_url = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'
# jwk_client = PyJWKClient(jwk_url)

# def verify_jwt(token):
#     signing_key = jwk_client.get_signing_key_from_jwt(token)
#     return jwt.decode(
#         token,
#         signing_key.key,
#         algorithms=["RS256"],
#         audience=client_id,
#         options={"verify_exp": True}
#     )

def handler(event, context):
    print(f"event => {json.dumps(event)}")

    auth_token = event['authorizationToken']

    try:
        # decoded_jwt = verify_jwt(auth_token)
        print(auth_token)

        return {
            'principalId': "kkkkk",
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
                'user': "trajce",
            },
        }
    except Exception as e:
        print(f"Token verification failed: {e}")

        # return {
        #     'principalId': 'user',
        #     'policyDocument': {
        #         'Version': '2012-10-17',
        #         'Statement': [
        #             {
        #                 'Action': 'execute-api:Invoke',
        #                 'Effect': 'Deny',
        #                 'Resource': event['methodArn'],
        #             },
        #         ],
        #     },
        #     'context': {
        #         'error': str(e),
        #     },
        # }
