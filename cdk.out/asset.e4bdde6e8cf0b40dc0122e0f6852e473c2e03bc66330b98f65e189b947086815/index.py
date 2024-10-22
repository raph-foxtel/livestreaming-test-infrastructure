# lambda/ci-cd-start-stack/index.py
import json
import boto3
import os

codebuild = boto3.client('codebuild')

def handler(event, context):
    try:
        body = json.loads(event['body'])
        stack_name = body['stackName']

        response = codebuild.start_build(
            projectName=os.environ['CODEBUILD_PROJECT_NAME'],
            environmentVariablesOverride=[
                {
                    'name': 'STACK_NAME',
                    'value': stack_name,
                    'type': 'PLAINTEXT'
                }
            ]
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': f'Deployment of stack {stack_name} started'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error starting deployment'})
        }
