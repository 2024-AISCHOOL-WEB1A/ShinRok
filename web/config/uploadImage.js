const { s3Client, S3_BUCKET, S3_REGION } = require('./s3Client');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// 이미지 파일 업로드 함수
const uploadImage = async (filePath) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: S3_BUCKET,
    Key: path.basename(filePath),
    Body: fileContent,
    ACL: 'public-read', // 파일을 공개 상태로 설정
    ContentType: 'image/jpeg', // 파일 유형 설정 (필요에 따라 변경)
  };
  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log(`Image uploaded successfully. URL: https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${params.Key}`);
  } catch (err) {
    console.error(`Image upload failed: ${err.message}`);
  }
};

module.exports = uploadImage;
