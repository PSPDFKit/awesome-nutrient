#
# https://registry.terraform.io/modules/terraform-aws-modules/ecs/aws/latest
# https://github.com/terraform-aws-modules/terraform-aws-ecs
#
locals {
  document_engine_environment = concat(
    var.document_engine_activation_key != null ? [{
      name  = "ACTIVATION_KEY"
      value = var.document_engine_activation_key
    }] : [],
    [
      {
        name  = "API_AUTH_TOKEN"
        value = var.document_engine_api_auth_token
      },
      {
        name  = "DASHBOARD_USERNAME"
        value = var.document_engine_dashboard_username
      },
      {
        name  = "DASHBOARD_PASSWORD"
        value = var.document_engine_dashboard_password
      },
      {
        name  = "LOG_LEVEL"
        value = var.document_engine_parameters.logging_level
      },
      {
        name  = "PORT"
        value = var.document_engine_parameters.port
      },
      {
        name  = "PGHOST"
        value = aws_db_instance.document_engine.address
      },
      {
        name  = "PGPORT"
        value = aws_db_instance.document_engine.port
      },
      {
        name  = "PGDATABASE"
        value = aws_db_instance.document_engine.db_name
      },
      {
        name  = "PGUSER"
        value = aws_db_instance.document_engine.username
      },
      {
        name  = "PGPASSWORD"
        value = local.document_engine_db_password
      },
      {
        name  = "PGSSL"
        value = "true"
      },
      {
        name  = "PGSSL_DISABLE_VERIFY"
        value = "true"
      },
      # {
      #   name  = "PGSSL_CA_CERTS"
      #   value = local.database_ca_certificates
      # },
      {
        name  = "ASSET_STORAGE_BACKEND"
        value = "built-in"
      }
    ],
    [for k, v in var.document_engine_parameters.extra_env : {
      name  = k
      value = v
    }]
  )
}

module "ecs_document_engine_service" {
  depends_on = [
    module.alb
  ]

  source = "terraform-aws-modules/ecs/aws//modules/service"

  name        = "document-engine"
  cluster_arn = module.ecs_cluster.arn

  cpu                      = var.document_engine_parameters.cpu
  memory                   = var.document_engine_parameters.memory
  autoscaling_min_capacity = var.document_engine_parameters.desired_count
  autoscaling_max_capacity = var.document_engine_parameters.desired_count
  desired_count            = var.document_engine_parameters.desired_count

  container_definitions = {

    document-engine = {
      essential = true
      image     = "public.ecr.aws/pspdfkit/document-engine:${var.document_engine_parameters.image_tag}"

      cpu               = var.document_engine_parameters.cpu
      memory            = var.document_engine_parameters.memory
      memoryReservation = 100

      environment = local.document_engine_environment

      portMappings = [
        {
          name          = "api"
          containerPort = var.document_engine_parameters.port
          protocol      = "tcp"
        }
      ]

      readonlyRootFilesystem = false

      enable_cloudwatch_logging        = true
      cloudwatch_log_group_name        = local.document_engine_cloudwatch_log_group_name
      create_cloudwatch_log_group      = true
      cloudwatch_log_retention_in_days = var.log_retention_days

      restartPolicy = {
        enabled = true
        # ignoredExitCodes     = [1]
        restartAttemptPeriod = 60
      }
    }
  }

  subnet_ids = module.cluster_vpc.private_subnets

  load_balancer = {
    service = {
      target_group_arn = module.alb.target_groups["document-engine"].arn
      container_name   = "document-engine"
      container_port   = var.document_engine_parameters.port
    }
  }

  security_group_ingress_rules = {
    alb = {
      description                  = "Service port"
      from_port                    = var.document_engine_parameters.port
      ip_protocol                  = "tcp"
      referenced_security_group_id = aws_security_group.document_engine_alb.id
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  security_group_ids = []
}

resource "aws_security_group" "document_engine_alb" {
  name_prefix = "${local.environment_name}-de-alb-"
  vpc_id      = module.cluster_vpc.vpc_id
  description = "Allow access to the Document Engine"
}
