const { s3Client, S3_BUCKET, S3_REGION } = require('./aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const uploadImage = async (filePath) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: S3_BUCKET,
    Key: path.basename(filePath),
    Body: fileContent,
    ACL: 'public-read',
    ContentType: 'image/jpeg',
  };
  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    const imageUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${params.Key}`;
    console.log(`Image uploaded successfully. URL: ${imageUrl}`);
    return imageUrl;
  } catch (err) {
    console.error(`Image upload failed: ${err.message}`);
    throw new Error('Image upload failed');
  }
};

module.exports = uploadImage;
