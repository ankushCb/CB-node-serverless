import AWS from 'aws-sdk';

import awsConfigUpdate from '../../utils/awsConfigUpdate';
import getErrorResponse from '../../utils/getErrorResponse';
import getSuccessResponse from '../../utils/getSuccessResponse';
import { CART_TABLE_NAME } from '../../dynamoDb/constants';

awsConfigUpdate();

export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const documentClient = new AWS.DynamoDB.DocumentClient();
  
  const {
    userId,
    cartData,
  } = JSON.parse(event.body);

  var params = {
    TableName: CART_TABLE_NAME,
    Key: {
      userId: userId,
    },
    ExpressionAttributeNames: {
      '#cartData': 'cartData'
    },
    ExpressionAttributeValues: {
      ':cartData': cartData,
    },
    UpdateExpression: 'SET #cartData = :cartData',
    ReturnValues: 'ALL_NEW',
  };

    const queryPromise = documentClient.update(params).promise();

    queryPromise
      .then((data) => {
        callback(null, getSuccessResponse(data))
      })
      .catch((error) => {
        console.log(error.message);
        callback(null, getErrorResponse(500, JSON.stringify(error.message)))
      });
}



