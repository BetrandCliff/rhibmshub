import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const r2=new S3Client({region:'auto',endpoint:process.env.R2_ENDPOINT,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID!,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY!}});
export async function putFile(key:string,body:Buffer,mime:string){await r2.send(new PutObjectCommand({Bucket:process.env.R2_BUCKET!,Key:key,Body:body,ContentType:mime}));}
export async function signedDownload(key:string,filename:string){return getSignedUrl(r2,new GetObjectCommand({Bucket:process.env.R2_BUCKET!,Key:key,ResponseContentDisposition:`attachment; filename="${filename.replaceAll('"','')}"`}),{expiresIn:300});}
