import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeExecutionWithMetadata, NodeOperationError,
} from "n8n-workflow";

import {getMinio} from "./utils";

export class MinIO implements INodeType {
	description: INodeTypeDescription = {
		name: "minioNode",
		displayName: "MinIO",
		description: "MinIO operation",
		group: ['transform'],
		inputs: ['main'],
		outputs: ['main'],
		subtitle: '={{$parameter["operation"]}}',
		icon: 'file:minio.png',
		properties: [
			{
				displayName: 'Resource',
				description: 'The resource to operate on.',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Bucket',
						value: 'bucket',
					},
					{
						name: 'Object',
						value: 'object',
					}
				],
				default: 'object',
				required: true
			},
			{
				name: 'operation',
				displayName: 'Operation',
				type: 'options',
				default: 'presignedGetObject',
				options: [
					{
						name: 'Presigned GET URL',
						value: 'presignedGetObject',
						description: 'Generate a presigned GET URL',
						displayOptions: {
							show: {
								resource: ['object'],
							},
						},
					},
					{
						name: 'Presigned PUT URL',
						value: 'presignedPutObject',
						description: 'Generate a presigned PUT URL',
						displayOptions: {
							show: {
								resource: ['object'],
							},
						},
					},
				],
			},
			{
				name: 'bucket',
				displayName: 'Bucket',
				type: 'string',
				default: '',
				required: true,
			},
			{
				name: 'key',
				displayName: 'Key',
				type: 'string',
				default: '',
				required: true,
			},
		],
		defaults: {
			name: 'MinIO',
		},
		version: 1,
		credentials: [
			{
				name: 'minioCredentialsApi',
				required: true,
			},
		]
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		const items = this.getInputData();
		let item: INodeExecutionData;

		const minioCredentials = await this.getCredentials('minioCredentialsApi');
		if (minioCredentials === undefined) {
			throw new NodeOperationError(this.getNode(),'No credentials got returned!');
		}

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			item = items[itemIndex];

			const minio = getMinio(minioCredentials);

			const resource = this.getNodeParameter('resource', itemIndex) as string;
			const operation = this.getNodeParameter('operation', itemIndex) as string;

			const bucket = this.getNodeParameter('bucket', itemIndex) as string;
			const key = this.getNodeParameter('key', itemIndex) as string;

			const method = __getOperation(resource, operation) as string;
			switch (method) {
				case 'presignedGetObject':
					try {
						item.json['url'] = await minio.presignedGetObject(bucket, key);
					} catch (e) {
						throw new NodeOperationError(this.getNode(), e);
					}
					break;
				case 'presignedPutObject':
					try {
						item.json['url'] = await minio.presignedPutObject(bucket, key);
					} catch (e) {
						throw new NodeOperationError(this.getNode(), e);
					}
					break;
				default:
					throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
			}
		}

		return this.prepareOutputData(items);
	}
}

function __getOperation(resource: string, operation: string) : string | null {
	if (resource === 'object' && operation === 'presignedGet') {
		return 'presignedGetObject';
	}

	return null;
}
