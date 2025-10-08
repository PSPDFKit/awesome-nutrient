#!/bin/bash

# Document Engine on OrbStack with Kubernetes - Automated Setup Script
# This script automates the deployment of Document Engine on OrbStack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored messages
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

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"

    if ! command_exists orb; then
        print_error "OrbStack is not installed. Please install it from https://orbstack.dev"
        exit 1
    fi
    print_info "✓ OrbStack is installed"

    if ! command_exists kubectl; then
        print_error "kubectl is not installed. Install it with: brew install kubectl"
        exit 1
    fi
    print_info "✓ kubectl is installed"

    if ! command_exists helm; then
        print_error "Helm is not installed. Install it with: brew install helm"
        exit 1
    fi
    print_info "✓ Helm is installed"

    # Check if Kubernetes is running
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Kubernetes cluster is not accessible. Please enable Kubernetes in OrbStack."
        exit 1
    fi
    print_info "✓ Kubernetes cluster is running"
}

# Install CloudNative-PG Operator
install_cloudnative_pg() {
    print_section "Installing CloudNative-PG Operator"

    helm repo add cnpg https://cloudnative-pg.github.io/charts 2>/dev/null || true
    helm repo update

    if helm list -n cnpg-system | grep -q cnpg; then
        print_info "CloudNative-PG is already installed, skipping..."
    else
        print_info "Installing CloudNative-PG Operator..."
        helm upgrade --install cnpg \
            --namespace cnpg-system \
            --create-namespace \
            cnpg/cloudnative-pg
        print_info "✓ CloudNative-PG Operator installed"
    fi
}

# Install Nginx Ingress Controller
install_nginx_ingress() {
    print_section "Installing Nginx Ingress Controller"

    if kubectl get namespace ingress-nginx &> /dev/null; then
        print_info "Nginx Ingress Controller is already installed, skipping..."
    else
        print_info "Installing Nginx Ingress Controller..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

        print_info "Waiting for Nginx Ingress Controller to be ready..."
        kubectl -n ingress-nginx wait \
            --for=condition=Available \
            deployment/ingress-nginx-controller \
            --timeout=300s
        print_info "✓ Nginx Ingress Controller is ready"
    fi
}

# Install Document Engine
install_document_engine() {
    print_section "Installing Document Engine"

    helm repo add nutrient https://pspdfkit.github.io/helm-charts 2>/dev/null || true
    helm repo update

    print_info "Installing Document Engine with Helm..."
    helm upgrade --install \
        --namespace document-engine \
        --create-namespace \
        document-engine nutrient/document-engine \
        -f document-engine.values.yaml \
        --set cloudNativePG.clusterSpec.storage.size=128Mi \
        --set cloudNativePG.clusterSpec.storage.storageClass=local-path \
        --set "ingress.hosts[0].host=document-engine.k8s.orb.local"

    print_info "✓ Document Engine installation initiated"
}

# Wait for Document Engine to be ready
wait_for_document_engine() {
    print_section "Waiting for Document Engine to be Ready"

    print_info "This may take a few minutes..."

    # Wait for database cluster to be ready
    print_info "Waiting for database cluster..."
    kubectl wait --for=condition=Ready \
        cluster/document-engine-postgresql \
        -n document-engine \
        --timeout=300s 2>/dev/null || true

    # Wait for Document Engine pods to be ready
    print_info "Waiting for Document Engine pods..."
    kubectl wait --for=condition=Ready \
        pod -l app.kubernetes.io/name=document-engine \
        -n document-engine \
        --timeout=300s

    print_info "✓ Document Engine is ready"
}

# Display access information
display_info() {
    print_section "Installation Complete!"

    echo ""
    echo "Document Engine is now running on your OrbStack Kubernetes cluster."
    echo ""
    echo "Access Information:"
    echo "  API Endpoint:  http://document-engine.k8s.orb.local"
    echo "  Dashboard:     http://document-engine.k8s.orb.local/dashboard"
    echo "  Dashboard User: admin"
    echo "  Dashboard Pass: admin"
    echo ""
    echo "API Authentication:"
    echo "  Use header: Authorization: Token token=secret"
    echo ""
    echo "Test the installation:"
    echo "  curl http://document-engine.k8s.orb.local/healthcheck"
    echo ""
    echo "Upload a sample document:"
    echo "  curl --request POST \\"
    echo "    --url http://document-engine.k8s.orb.local/api/documents \\"
    echo "    --header 'Authorization: Token token=secret' \\"
    echo "    --form 'pdf-file-from-multipart=@sample.pdf' \\"
    echo "    --form 'instructions={\"parts\":[{\"file\":\"pdf-file-from-multipart\"}],\"actions\":[],\"output\":{\"type\":\"pdf\"}}'"
    echo ""
    echo "View logs:"
    echo "  kubectl logs -n document-engine -l app.kubernetes.io/name=document-engine"
    echo ""
    echo "For more information, see the README.md file."
    echo ""
}

# Main installation flow
main() {
    print_section "Document Engine on OrbStack - Setup"

    check_prerequisites
    install_cloudnative_pg
    install_nginx_ingress
    install_document_engine
    wait_for_document_engine
    display_info
}

# Run main function
main
