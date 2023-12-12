import { IDataObject, INodeListSearchResult } from 'n8n-workflow';
import * as Minio from 'minio';
import { ILoadOptionsFunctions } from 'n8n-core';

export async function searchBuckets(
	this: ILoadOptionsFunctions,
	filter?: string | undefined,
	paginationToken?: string | undefined,
): Promise<INodeListSearchResult> {
	const minioCredentials = await this.getCredentials('minioCredentialsApi');
	const minio = getMinio(minioCredentials);
	let returnData = { results: [] } as INodeListSearchResult;

	const buckets = await minio.listBuckets();
	for (const bucket of buckets) {
		returnData.results.push({
			name: bucket.name,
			value: bucket.name,
		});
	}

	return returnData;
}

export function getMinio(credentials: IDataObject): Minio.Client {
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
