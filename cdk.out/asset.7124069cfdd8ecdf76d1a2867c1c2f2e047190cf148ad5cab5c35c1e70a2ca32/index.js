// start a stack
const AWS = require('aws-sdk');
const codebuild = new AWS.CodeBuild();

exports.handler = async (event) => {
  const stackName = JSON.parse(event.body).stackName;

  const params = {
    projectName: process.env.CODEBUILD_PROJECT_NAME,
    environmentVariablesOverride: [
      {
        name: 'STACK_NAME',
        value: stackName,
        type: 'PLAINTEXT'
      }
    ]
  };

  try {
    await codebuild.startBuild(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Deployment of stack ${stackName} started` }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error starting deployment' }),
    };
  }
};
