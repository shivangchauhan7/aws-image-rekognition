const AWS = require("aws-sdk");
const rekognition = new AWS.Rekognition();
const sns = new AWS.SNS();

exports.identifyImg = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  const params = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    MaxLabels: 123,
    MinConfidence: 80,
  };

  try {
    const rekognitionData = await rekognition.detectLabels(params).promise();
    const snsParams = {
      Message: `This image identifies with these - ${rekognitionData.Labels.map((el) => el.Name).toString()}`,
      Subject: "Image details",
      TopicArn: "arn:aws:sns:us-east-2:175749735948:img-Topic",
    };
    await sns.publish(snsParams).promise();
  } catch (e) {
    console.log(e);
  }
};
