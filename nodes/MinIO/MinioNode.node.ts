import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeExecutionWithMetadata,
	NodeOperationError,
} from 'n8n-workflow';

import { getMinio, searchBuckets } from './utils';

export class MinIO implements INodeType {
	description: INodeTypeDescription = {
		name: 'minioNode',
		displayName: 'MinIO',
		description: 'MinIO operation',
		group: ['transform'],
		inputs: ['main'],
		outputs: ['main'],
		subtitle: '={{$parameter["operation"]}}',
		icon: 'file:minio.svg',
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bucket',
						value: 'bucket',
					},
					{
						name: 'Object',
						value: 'object',
					},
				],
				default: 'object',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
						action: 'Generate a presigned GET URL',
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
						action: 'Generate a presigned PUT URL',
					},
				],
			},
			{
				displayName: 'Bucket',
				name: 'bucket',
				type: 'resourceLocator',
				required: true,
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a Bucket...',
						typeOptions: {
							searchListMethod: 'searchBuckets',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						placeholder: 'bucket_name',
					},
				],
			},
			{
				displayName: 'Key',
				name: 'key',
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
		],
	};

	methods = {
		listSearch: {
			searchBuckets,
		},
	};

	async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		const items = this.getInputData();
		let item: INodeExecutionData;

		const minioCredentials = await this.getCredentials('minioCredentialsApi');
		if (minioCredentials === undefined) {
			throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
		}

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			item = items[itemIndex];

			const minio = getMinio(minioCredentials);

			const operation = this.getNodeParameter('operation', itemIndex) as string;

			const bucket = this.getNodeParameter('bucket', itemIndex, '', {
				extractValue: true,
			}) as string;
			const key = this.getNodeParameter('key', itemIndex) as string;

			switch (operation) {
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
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported!`,
					);
			}
		}

		return this.prepareOutputData(items);
	}
}
