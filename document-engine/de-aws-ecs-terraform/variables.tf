# AWS

variable "aws_profile_name" {
  type    = string
  default = "default"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "eu-north-1"
}

# Document Engine

variable "document_engine_activation_key" {
  description = "Document Engine activation key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "document_engine_api_auth_token" {
  description = "Document Engine auth token for the API"
  type        = string
  sensitive   = true
}

variable "document_engine_dashboard_username" {
  description = "Document Engine dashboard username"
  type        = string
  sensitive   = true
}

variable "document_engine_dashboard_password" {
  description = "Document Engine dashboard password"
  type        = string
  sensitive   = true
}

variable "document_engine_parameters" {
  description = "Document Engine parameters"
  type = object({
    image_tag           = string
    cpu                 = number
    memory              = number
    desired_count       = number
    logging_level       = string
    port                = number
    jwt_algorithm       = string
    jwt_public_key_path = string
    extra_env           = map(string)
  })
}

# ECS Infrastructure

variable "environment_name" {
  description = "Name of the ECS cluster, takes precedence over `environment_name_prefix` if set"
  type        = string
  default     = null
}

variable "environment_name_prefix" {
  description = "Name prefix of the ECS cluster"
  type        = string
}

variable "log_retention_days" {
  description = "Retention period for CloudWatch logs in days"
  type        = number
  default     = 7
}

variable "additional_tags" {
  description = "A map of tags to assign to all resources"
  type        = map(string)
  default     = {}
}
