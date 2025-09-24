#
# https://registry.terraform.io/modules/terraform-aws-modules/ecs/aws/latest
# https://github.com/terraform-aws-modules/terraform-aws-ecs
#
locals {
  environment_name = (
    var.environment_name == null ?
    "${var.environment_name_prefix}-${random_string.cluster_suffix.result}" :
    var.environment_name
  )

  ecs_cluster_cloudwatch_log_group_name     = "/aws/ecs/${local.environment_name}"
  document_engine_cloudwatch_log_group_name = "/aws/document-engine/${local.environment_name}"
}

resource "random_string" "cluster_suffix" {
  length  = 5
  special = false
}

module "ecs_cluster" {
  source = "terraform-aws-modules/ecs/aws//modules/cluster"

  name = local.environment_name

  cloudwatch_log_group_name              = local.ecs_cluster_cloudwatch_log_group_name
  cloudwatch_log_group_retention_in_days = var.log_retention_days
  configuration = {
    execute_command_configuration = {
      kms_key_id = aws_kms_key.ecs_cluster["main"].key_id
      logging    = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = local.ecs_cluster_cloudwatch_log_group_name
      }
    }
    managed_storage_configuration = {
      fargate_ephemeral_storage_kms_key_id = aws_kms_key.ecs_cluster["fargate_ephemeral_storage"].arn
      kms_key_id                           = aws_kms_key.ecs_cluster["managed_storage"].key_id
    }
  }
  setting = [
    {
      "name" : "containerInsights",
      "value" : "enabled"
    }
  ]

  # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html
  default_capacity_provider_strategy = {
    FARGATE = {
      weight = 50
      base   = 20
    }
    FARGATE_SPOT = {
      weight = 50
    }
  }
}

# 
locals {
  ecs_kms_key_keys = [
    "main",
    "managed_storage",
    "fargate_ephemeral_storage"
  ]
}

# KMS key policy document
data "aws_iam_policy_document" "ecs_kms_key" {
  statement {
    sid    = "Enable IAM User Permissions"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "Allow Fargate service principal for ephemeral storage encryption"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["fargate.amazonaws.com"]
    }
    actions = [
      "kms:GenerateDataKeyWithoutPlaintext",
      "kms:CreateGrant",
      "kms:DescribeKey",
      "kms:Decrypt"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:ecs:clusterAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:ecs:clusterName"
      values   = [local.environment_name]
    }
  }
}

resource "aws_kms_key" "ecs_cluster" {
  for_each = toset(local.ecs_kms_key_keys)

  description             = "ECS cluster key: ${local.environment_name} - ${each.key}"
  enable_key_rotation     = true
  deletion_window_in_days = 10
}

resource "aws_kms_alias" "ecs_cluster" {
  for_each = toset(local.ecs_kms_key_keys)

  name_prefix   = "alias/${local.environment_name}-${each.key}-"
  target_key_id = aws_kms_key.ecs_cluster[each.key].id
}

resource "aws_kms_key_policy" "ecs_cluster" {
  for_each = toset(local.ecs_kms_key_keys)

  key_id = aws_kms_key.ecs_cluster[each.key].id
  policy = data.aws_iam_policy_document.ecs_kms_key.json
}
