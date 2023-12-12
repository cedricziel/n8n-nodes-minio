import {IDataObject} from "n8n-workflow";
import * as Minio from "minio";

export function getMinio(credentials: IDataObject) : Minio.Client {
	const endpoint = credentials.endPoint as string;
	const port = credentials.port as number;
	const useSSL = credentials.useSSL as boolean;
	const accessKey = credentials.accessKeyId as string;
	const accessSecretKey = credentials.accessKeySecret as string;

	return new Minio.Client({
		endPoint: endpoint,
		port: port,
		useSSL: useSSL,
		accessKey: accessKey,
		secretKey: accessSecretKey,
	});
}
