var AWS = require('aws-sdk');
var fs = require('fs');
var { groceryList } = require('./data/groceryList');

// Configure the AWS to lookup the right server and endpoint for DynamoDB
// In case of local set endpoint to localhost
AWS.config.update({
  region: 'ap-south-1',
  endpoint: 'http://localhost:8000',
});

var docClient = new AWS.DynamoDB.DocumentClient();

groceryList.forEach(function(item) {
  var params = {
    TableName: 'grocery',
    Item: {
      groceryId: item.groceryId,
      name: item.name,
      url: item.url,
      category: item.category,
      subCategory: item.subCategory,
      price: item.price,
    },
  };
  
  docClient.put(params, function(err, data) {
    if (err) {
      console.log('unable to add ', err);
    } else {
      console.log('succeeded ', data);
    }
  })
});


