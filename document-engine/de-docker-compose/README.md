# Document Engine example — deploying with Docker Compose and Caddy

- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API usage examples](#api-usage-examples)
- [Cleanup](#cleanup)
- [Support](#support)
- [License](#license)
- [Contributing](#contributing)

> This example demonstrates a local [Nutrient Document Engine](https://www.nutrient.io/guides/document-engine/) deployment using Docker Compose, PostgreSQL, MinIO, and Caddy.

This stack is intended for local development and manual testing of large uploads. It includes a `README`, a `setup.sh`, a dedicated configuration file, and a sample document for smoke tests.

## Prerequisites

- A Docker-compatible runtime with `docker compose` support
- `curl`

## Getting started

1. Run the automated setup script:

   ```bash
   ./setup.sh
   ```

2. Wait for the script to report that the stack is healthy, then open:

   ```text
   http://localhost:5000/dashboard
   ```

Default credentials:

- Username: `admin`
- Password: `admin`

The setup script starts four services:

- PostgreSQL for Document Engine metadata
- MinIO as the local S3-compatible asset store
- Document Engine itself
- Caddy as the reverse proxy in front of Document Engine

## Configuration

The local profile lives in `document-engine.env.sh`. `setup.sh` sources that file before calling `docker compose`, so you can either:

- Edit `document-engine.env.sh`
- Override individual values in your shell before running `./setup.sh`

Example:

```bash
export CADDY_HTTP_PORT=5050
export DASHBOARD_PASSWORD=supersecret
./setup.sh
```

You can also choose the Document Engine image tag at invocation time:

```bash
./setup.sh
./setup.sh nightly
```

The default tag is `latest`.

The default profile is tuned for multi-GB uploads:

- `MAX_UPLOAD_SIZE_BYTES=50000000000`
- `SERVER_REQUEST_TIMEOUT=900000`
- `PSPDFKIT_WORKER_TIMEOUT=900000`
- `FILE_UPLOAD_TIMEOUT_MS=900000`
- `ASSET_STORAGE_CACHE_SIZE=20000000000`

To actually test large documents, you must provide a valid `ACTIVATION_KEY`. Without one, Document Engine runs with license-imposed trial limits and uploads are capped at `50 MB`, even though the local proxy and runtime configuration allow much larger request bodies.

Caddy is configured to:

- Allow request bodies up to `50GB`
- Proxy `/i/d/.../h/.../page-*` tile-rendering requests upstream over HTTP/2
- Keep all other upstream requests on HTTP/1.1 with `response_header_timeout 15m`

The example still exposes the dashboard at `http://localhost:5000/dashboard`. That is intentional: the special HTTP/2 requirement applies to the upstream Caddy-to-Document-Engine hop for tile rendering, which is configured with cleartext HTTP/2 (`h2c`). If you also want browser-to-Caddy HTTP/2, the stack would need to switch to local HTTPS instead of the current `auto_https off` setup.

## API usage examples

Once the stack is running, you can use the [Document Engine API](https://www.nutrient.io/api/reference/document-engine/upstream/) directly through Caddy.

### Upload a document

```bash
curl --request POST \
  --url http://localhost:5000/api/documents \
  --header 'Authorization: Token token=secret' \
  --form 'pdf-file-from-multipart=@sample.pdf' \
  --form 'instructions={"parts":[{"file":"pdf-file-from-multipart"}],"actions":[],"output":{"type":"pdf","metadata":{"title":"Test Document","author":"API User"}}}'
```

### List documents

```bash
curl --request GET \
  --url http://localhost:5000/api/documents \
  --header 'Authorization: Token token=secret'
```

### Get document information

Replace `DOCUMENT_ID` with the actual document ID from the upload response:

```bash
curl --request GET \
  --url http://localhost:5000/api/documents/DOCUMENT_ID/document_info \
  --header 'Authorization: Token token=secret'
```

### Extract text

```bash
curl --request GET \
  --url http://localhost:5000/api/documents/DOCUMENT_ID/pages/text \
  --header 'Authorization: Token token=secret'
```

### Download PDF

```bash
curl --request GET \
  --url http://localhost:5000/api/documents/DOCUMENT_ID/pdf \
  --header 'Authorization: Token token=secret' \
  --output downloaded-document.pdf
```

## Cleanup

Stop the stack:

```bash
docker compose down
```

Remove the stack and local volumes:

```bash
docker compose down -v
```

## Support

Nutrient offers support for customers with an active SDK license via [Nutrient Support](https://www.nutrient.io/support/request/).

Are you [evaluating our SDK](https://www.nutrient.io/sdk/try)? That's great, we're happy to help out. To make sure this is fast, please use a work email and have someone from your company fill out our [sales form](https://www.nutrient.io/contact-sales/).

## License

This project is licensed under the BSD license. See the LICENSE file for more details.

## Contributing

Please ensure you have signed our CLA so that we can accept your contributions.
