#!/usr/bin/env bash

set -euo pipefail

PUBLIC_KEY_NAME=JWT_PUBLIC_KEY.pem
PRIVATE_KEY_NAME=JWT_PRIVATE_KEY.key

# Generate the private key
openssl genpkey -algorithm RSA -out "${PRIVATE_KEY_NAME}" -pkeyopt rsa_keygen_bits:2048

# Set permissions for the private key
chmod 600 "${PRIVATE_KEY_NAME}"

# Generate public key from private key
openssl rsa -in "${PRIVATE_KEY_NAME}" -pubout -outform PEM -out "${PUBLIC_KEY_NAME}"
