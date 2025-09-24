terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.31"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.12"
    }
  }
}

provider "aws" {
  profile = var.aws_profile_name
  region  = var.aws_region

  default_tags {
    tags = local.tags
  }
}

provider "aws" {
  profile = var.aws_profile_name
  region  = "us-east-1"
  alias   = "virginia"

  default_tags {
    tags = local.tags
  }
}

#
# Data
#
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
data "aws_ecrpublic_authorization_token" "token" {
  provider = aws.virginia
}

locals {
  tags = merge(
    {
      MadeBy    = "Nutrient"
      ManagedBy = "Terraform"
    },
    var.additional_tags
  )

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  aws_region_name = data.aws_region.current.region
  aws_account_id  = data.aws_caller_identity.current.account_id
}
