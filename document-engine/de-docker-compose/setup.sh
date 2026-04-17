#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=./document-engine.env.sh
source "$SCRIPT_DIR/document-engine.env.sh"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_usage() {
    cat <<EOF
Usage: ./setup.sh [IMAGE_TAG]

Examples:
  ./setup.sh
  ./setup.sh nightly
EOF
}

parse_args() {
    local positional=()

    while [ "$#" -gt 0 ]; do
        case "$1" in
            -h|--help)
                print_usage
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
            *)
                positional+=("$1")
                shift
                ;;
        esac
    done

    if [ "${#positional[@]}" -gt 1 ]; then
        print_error "Only one positional IMAGE_TAG is supported"
        print_usage
        exit 1
    fi

    if [ "${#positional[@]}" -eq 1 ]; then
        DOCUMENT_ENGINE_IMAGE_TAG="${positional[0]}"
        DOCUMENT_ENGINE_IMAGE="${DOCUMENT_ENGINE_IMAGE_REPOSITORY}:${DOCUMENT_ENGINE_IMAGE_TAG}"
    fi
}

check_prerequisites() {
    print_section "Checking Prerequisites"

    if ! command_exists docker; then
        print_error "Docker is not installed. Install a Docker-compatible runtime first."
        exit 1
    fi
    print_info "✓ docker is installed"

    if ! docker compose version >/dev/null 2>&1; then
        print_error "docker compose is not available. Update Docker or install the Compose plugin."
        exit 1
    fi
    print_info "✓ docker compose is available"

    if ! command_exists curl; then
        print_error "curl is required to verify the stack health."
        exit 1
    fi
    print_info "✓ curl is installed"
}

start_stack() {
    print_section "Starting Docker Compose Stack"

    cd "$SCRIPT_DIR"

    print_info "Using Document Engine image: ${DOCUMENT_ENGINE_IMAGE}"

    print_info "Pulling container images..."
    docker compose pull

    print_info "Starting PostgreSQL, MinIO, Document Engine, and Caddy..."
    docker compose up -d
}

wait_for_document_engine() {
    print_section "Waiting for Document Engine to be Ready"

    local healthcheck_url="http://localhost:${CADDY_HTTP_PORT}/healthcheck"
    local max_attempts=180
    local attempt=1

    print_info "Polling ${healthcheck_url}"

    until curl --fail --silent --show-error "$healthcheck_url" >/dev/null; do
        if [ "$attempt" -ge "$max_attempts" ]; then
            print_error "Document Engine did not become ready in time."
            print_warning "Current container status:"
            docker compose ps
            exit 1
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    print_info "✓ Document Engine is ready"
}

display_info() {
    print_section "Installation Complete!"

    echo ""
    echo "Document Engine is now running with Docker Compose."
    echo ""
    echo "Access Information:"
    echo "  API Endpoint:   http://localhost:${CADDY_HTTP_PORT}"
    echo "  Dashboard:      http://localhost:${CADDY_HTTP_PORT}/dashboard"
    echo "  Dashboard User: ${DASHBOARD_USERNAME}"
    echo "  Dashboard Pass: ${DASHBOARD_PASSWORD}"
    echo "  MinIO Console:  http://localhost:${MINIO_CONSOLE_PORT}"
    echo ""
    echo "API Authentication:"
    echo "  Use header: Authorization: Token token=${API_AUTH_TOKEN}"
    echo ""
    echo "Storage:"
    echo "  Backend: ${ASSET_STORAGE_BACKEND}"
    echo "  Bucket:  ${ASSET_STORAGE_S3_BUCKET}"
    echo ""
    echo "Test the installation:"
    echo "  curl http://localhost:${CADDY_HTTP_PORT}/healthcheck"
    echo ""
    echo "Upload a sample document:"
    echo "  curl --request POST \\"
    echo "    --url http://localhost:${CADDY_HTTP_PORT}/api/documents \\"
    echo "    --header 'Authorization: Token token=${API_AUTH_TOKEN}' \\"
    echo "    --form 'pdf-file-from-multipart=@sample.pdf' \\"
    echo "    --form 'instructions={\"parts\":[{\"file\":\"pdf-file-from-multipart\"}],\"actions\":[],\"output\":{\"type\":\"pdf\"}}'"
    echo ""
    echo "View logs:"
    echo "  docker compose logs -f"
    echo ""
    echo "Override defaults by exporting variables before rerunning setup.sh,"
    echo "or edit document-engine.env.sh for a shared local profile."
    echo ""
}

main() {
    print_section "Document Engine with Docker Compose - Setup"

    parse_args "$@"
    check_prerequisites
    start_stack
    wait_for_document_engine
    display_info
}

main "$@"
