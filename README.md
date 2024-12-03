# n8n-nodes-minio

This is an n8n community node. It lets you use the minio client library in your n8n workflows.

The primary motivation was to create an easy way to create pre-signed URLs easily.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Objects

* `presignedGetObject` - create a presigned URL for an object
* `presignedPutObject` - create a presigned upload URL for an object
* `removeObject` - remove an object

## Credentials

To use the minio credentials, you'll need to provide the following:

* Access Key
* Secret Key
* Endpoint

## License

[MIT](./LICENSE.md)
