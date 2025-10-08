# Document Engine example — deploying on OrbStack with Kubernetes

  - [About OrbStack](#about-orbstack)
  - [Prerequisites](#prerequisites)
  - [Getting started](#getting-started)
  - [API usage examples](#api-usage-examples)
  - [Support](#support)
  - [License](#license)
  - [Contributing](#contributing)

> This example demonstrates a minimal installation of [Nutrient Document Engine](https://www.nutrient.io/guides/document-engine/) on a local Kubernetes cluster using OrbStack. 

## About OrbStack

[OrbStack](https://orbstack.dev) is a fast, lightweight alternative to Docker Desktop for macOS. It provides native support for running Docker containers and Kubernetes clusters with minimal resource usage and excellent performance.

This example uses OrbStack’s built-in Kubernetes support to deploy Document Engine locally, making it ideal for:
- Local development and testing
- Learning Document Engine deployment on Kubernetes
- Prototyping before deploying to production clusters

## Prerequisites

- [OrbStack](https://orbstack.dev) installed with Kubernetes enabled
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/) - Kubernetes command-line tool
- [Helm](https://helm.sh/docs/intro/install/) - Kubernetes package manager

You can install kubectl and Helm on macOS using Homebrew:

```bash
brew install kubectl helm
```

## Getting started

1. **Install OrbStack and enable Kubernetes** (one-time setup)
   ```bash
   brew install --cask orbstack
   ```
   After installation, open the OrbStack app and enable Kubernetes from the settings panel. To verify Kubernetes is running:
   ```bash
   kubectl version
   ```

2. **Run the automated setup script**
   ```bash
   ./setup.sh
   ```

The script will automatically install all dependencies and deploy Document Engine. This typically takes 3-5 minutes.

## API usage examples

Once Document Engine is running, you can use the [Document Engine API](https://www.nutrient.io/api/reference/document-engine/upstream/) to perform different operations. Below are a few examples:

### Upload a document

Upload the sample PDF document:

```bash
curl --request POST \
  --url http://document-engine.k8s.orb.local/api/documents \
  --header 'Authorization: Token token=secret' \
  --form 'pdf-file-from-multipart=@sample.pdf' \
  --form 'instructions={"parts":[{"file":"pdf-file-from-multipart"}],"actions":[],"output":{"type":"pdf","metadata":{"title":"Test Document","author":"API User"}}}'
```

The response will include a `document_id` that you can use in the following examples.

### List documents

```bash
curl --request GET \
  --url http://document-engine.k8s.orb.local/api/documents \
  --header 'Authorization: Token token=secret'
```

### Get document information

Replace `DOCUMENT_ID` with the actual document ID from the upload response:

```bash
curl --request GET \
  --url http://document-engine.k8s.orb.local/api/documents/DOCUMENT_ID/document_info \
  --header 'Authorization: Token token=secret'
```

### Extract text

Extract text from all pages:

```bash
curl --request GET \
  --url http://document-engine.k8s.orb.local/api/documents/DOCUMENT_ID/pages/text \
  --header 'Authorization: Token token=secret'
```

### Download PDF

Download the processed PDF:

```bash
curl --request GET \
  --url http://document-engine.k8s.orb.local/api/documents/DOCUMENT_ID/pdf \
  --header 'Authorization: Token token=secret' \
  --output downloaded-document.pdf
```

## Support

Nutrient offers support for customers with an active SDK license via [Nutrient Support](https://www.nutrient.io/support/request/).

Are you [evaluating our SDK](https://www.nutrient.io/sdk/try)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our [sales form](https://www.nutrient.io/contact-sales/).

## License

This project is licensed under the BSD license. See the LICENSE file for more details.

## Contributing

Please ensure you have signed our CLA so that we can accept your contributions.
