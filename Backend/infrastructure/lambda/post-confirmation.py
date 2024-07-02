import boto3

client = boto3.client('cognito-idp')

def handler(event, context):
    if event['triggerSource'] == "PostConfirmation_ConfirmSignUp":
        group_params = {
            'UserPoolId': event['userPoolId'],
            'Username': event['userName'],
            'GroupName': 'admin'
        }
        try:
            response = client.admin_add_user_to_group(**group_params)
            print("User added to group successfully:", response)
        except Exception as e:
            print("Error adding user to group:", e)
    
    return event
