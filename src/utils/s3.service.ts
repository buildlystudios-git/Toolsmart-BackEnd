import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
      },
    });
  }

  /**
   * Upload Base64 Image to S3
   */
  async uploadBase64(
    base64: string,
    filename: string
  ): Promise<{ key: string; url: string }> {
    const awsRegion = process.env.AWS_REGION?? 'ap-south-1';
    const awsBucket = process.env.AWS_BUCKET?? 'toolsmart';

    try {
      if(this.isS3ImageUploaded(base64) ){
        this.logger.log(`Image already exists in S3: ${base64}`);
        return {
          key: base64,
          url: base64,
        };
      }
      else{
        const matches = base64.match(/^data:(.+);base64,(.+)$/);

        if (!matches) {
          throw new BadRequestException('Invalid base64 format');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        const buffer = Buffer.from(base64Data, 'base64');

        const extension = mimeType.split('/')[1];
        const key = `img/${filename || uuid()}.${extension}`;

        const command = new PutObjectCommand({
          Bucket: awsBucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        });

        await this.s3.send(command);

        this.logger.log(`Image uploaded to S3: ${key}`);
        return {
          key,
          url: `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${key}`,
        };
      }
    } catch (error: unknown) {
      
      this.logger.error(`S3 upload failed: ${String(error)}`);
      throw error;
    }
  }

    async uploadMultipleBase64(
        images: string[],
        filename: string
    ): Promise<{ key: string; url: string }[]> {    
        let imageCount = 1;
        const uploadPromises = images.map((img) =>
            this.uploadBase64(img, `${filename}-${imageCount++}`),
        );

        return Promise.all(uploadPromises);
    }

    isS3ImageUploaded(imageUrl: string) {
      if (!imageUrl) return false;

      try {
        const url = new URL(imageUrl);

        const bucket = process.env.AWS_BUCKET;
        const region = process.env.AWS_REGION;

        const expectedHost = `${bucket}.s3.${region}.amazonaws.com`;

        return (
          url.hostname === expectedHost &&
          url.pathname.startsWith('/img/')
        );
      } catch {
        return false;
      }
    }
}