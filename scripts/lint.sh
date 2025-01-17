#!/usr/bin/env bash

set -o errexit

eslint --config eslint.config.mjs .
