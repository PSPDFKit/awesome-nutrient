output "vpc_id" {
  description = "ID of the VPC"
  value       = module.cluster_vpc.vpc_id
}

output "cluster_subnet_cidrs" {
  description = "List of CIDRs of the public subnets"
  value       = local.cluster_subnets
}

output "public_subnet_ids" {
  description = "List of IDs of the public subnets"
  value       = module.cluster_vpc.public_subnets
}

output "private_subnet_ids" {
  description = "List of IDs of the private subnets"
  value       = module.cluster_vpc.private_subnets
}

output "cluster_id" {
  description = "ID of the ECS cluster"
  value       = module.ecs_cluster.id
}

output "cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs_cluster.arn
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs_cluster.name
}
