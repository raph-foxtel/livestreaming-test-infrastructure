# lambda/ci-cd-start-stack/index.py
import json
import boto3
import os

codebuild = boto3.client('codebuild')

def lambda_handler(event, context):
    try:
        project_name = os.environ['CODEBUILD_PROJECT_NAME']
        
        response = codebuild.start_build(
            projectName=project_name
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Deployment started for project {project_name}',
                'buildId': response['build']['id']
            })
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error starting deployment'})
        }
