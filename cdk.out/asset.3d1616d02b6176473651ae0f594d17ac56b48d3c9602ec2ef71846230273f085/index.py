# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import boto3
import logging
import json
emp_client = boto3.client('mediapackage')
ssm_client = boto3.client('ssm')

def get_mediapackage_ingest_details(channel_id):
    # Initialize a session using Boto3
    try:
        # Get the channel information
        response = emp_client.describe_channel(Id=channel_id)

        # Extract the ingest endpoints
        ingest_endpoints = response.get('HlsIngest', {}).get('IngestEndpoints', [])
        
        # Check if there are ingest endpoints available
        if not ingest_endpoints:
            raise Exception(f"No ingest endpoints found for channel ID: {channel_id}")
        
        # Get the details of the first ingest endpoint
        ingest_details = ingest_endpoints[0]
        
        # Extract the URL, username, and password
        ingest_url = ingest_details.get('Url')
        username = ingest_details.get('Username')
        password = ingest_details.get('Password')
        return ingest_url, username, password
    except Exception as e:
        print("Error Command - emp origin endpoint ID " + endpointId + "failed")
        print(e)
        return 'error'
        
def get_mediapackage_cmaf_output(endpoint_id):
    # Initialize a session using Boto3
    try:
        response = emp_client.describe_origin_endpoint(Id=endpoint_id)
        responseValue = str(response['CmafPackage']['HlsManifests'][0]['Url'])
        return responseValue
    except Exception as e:
        print("Error Command - emp origin endpoint ID " + endpoint_id + "failed")
        print(e)
        return 'error'
    
def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.info (f"Input parameters from cloud formation: {event}")
    endpointId = event["mediaPackageEndpointId"]
    channelId = event["mediaPackageChannelId"]
    ssmName = event["ssmName"]
    print(endpointId)
    cmafOutput=get_mediapackage_cmaf_output(endpointId)
    ingest_url, username, password=get_mediapackage_ingest_details(channelId)
    parameter_data = {
        "ingestUrl": ingest_url,
        "username": username,
        "password": password,
        "cmafOutput": cmafOutput
    }
    logger.info(parameter_data)
    ssm_response = ssm_client.put_parameter(
        Name=ssmName,
        Description='Cmaf output Url',
        Value=json.dumps(parameter_data),
        Type='String',
        Overwrite=True
    )
    logger.info(ssm_response)
    return parameter_data

