#
# https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest
# https://github.com/terraform-aws-modules/terraform-aws-vpc
#
locals {
  vpc_cidr = "10.0.0.0/16"
  cluster_subnets = {
    private     = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 1)]
    public      = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 11)]
    intra       = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 21)]
    database    = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 101)]
    elasticache = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 201)]
  }
}

module "cluster_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${local.environment_name}-vpc"

  azs                             = local.azs
  cidr                            = local.vpc_cidr
  private_subnets                 = local.cluster_subnets.private
  public_subnets                  = local.cluster_subnets.public
  intra_subnets                   = local.cluster_subnets.intra
  create_database_subnet_group    = true
  database_subnets                = local.cluster_subnets.database
  create_elasticache_subnet_group = false
  elasticache_subnets             = local.cluster_subnets.elasticache

  create_igw             = true
  enable_nat_gateway     = true
  single_nat_gateway     = true
  one_nat_gateway_per_az = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  enable_flow_log = false

  tags = {
    Name = "${local.environment_name}-vpc"
  }
}
