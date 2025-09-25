#
# https://registry.terraform.io/modules/terraform-aws-modules/alb/aws/latest
# https://github.com/terraform-aws-modules/terraform-aws-alb
#
module "alb" {
  source = "terraform-aws-modules/alb/aws"

  name = local.environment_name

  load_balancer_type = "application"

  vpc_id  = module.cluster_vpc.vpc_id
  subnets = module.cluster_vpc.public_subnets

  enable_deletion_protection = false

  security_group_ingress_rules = {
    all_http = {
      from_port   = 80
      to_port     = 80
      ip_protocol = "tcp"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = module.cluster_vpc.vpc_cidr_block
    }
  }

  listeners = {
    ex_http = {
      port     = 80
      protocol = "HTTP"
      forward = {
        target_group_key = "document-engine"
      }
    }
  }
  target_groups = {
    document-engine = {
      backend_protocol                  = "HTTP"
      backend_port                      = var.document_engine_parameters.port
      target_type                       = "ip"
      deregistration_delay              = 5
      load_balancing_cross_zone_enabled = true

      health_check = {
        enabled             = true
        healthy_threshold   = 5
        interval            = 30
        matcher             = "200"
        path                = "/healthcheck"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
      }
      create_attachment = false
    }
  }

  security_groups = [
    aws_security_group.document_engine_alb.id
  ]
}