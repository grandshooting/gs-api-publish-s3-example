# gs-api-publish-s3-example

Example project that shows how to use the Grand Shooting REST API to publish media to a AWS S3 Bucket.
Runs with nodejs >= 10

It lists validated pictures, upload them to S3 and mark them published in Grand Shooting 


## Usage

Get an API token from Grand Shooting
https://account.grand-shooting.com/team-management/api#apikeys

Create a bucket on Amazon S3

Write a config.json file like 
```json
    {
    	"token":<your gs token>,
    	"bucket" : <aws bucket name>,
    	"prefix" : <prefix path in bucket>
    }
```

```
npm install
```
Then run program
```
node index.js
```

For more details, Grand Shooting API documentation
https://api.grand-shooting.com/
