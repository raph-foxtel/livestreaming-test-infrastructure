# lambda/index.py
import json
import os
import boto3

codebuild = boto3.client('codebuild')
cloudformation = boto3.client('cloudformation')

def lambda_handler(event, context):
    http_method = event['httpMethod']
    body = json.loads(event['body'])
    stack_name = body['stackName']

    if http_method == 'POST':
        # Start a new stack
        codebuild.start_build(
            projectName=os.environ['CODEBUILD_PROJECT_NAME'],
            environmentVariablesOverride=[
                {
                    'name': 'STACK_NAME',
                    'value': stack_name
                },
            ]
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': f'Stack {stack_name} creation started'})
        }
    elif http_method == 'DELETE':
        # Destroy a stack
        cloudformation.delete_stack(StackName=stack_name)
        return {
            'statusCode': 200,
            'body': json.dumps({'message': f'Stack {stack_name} deletion started'})
        }
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid request'})
        }
