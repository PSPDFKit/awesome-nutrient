locals {
  document_engine_db_password_version = 1 # for rotation
  document_engine_db_password         = sensitive(random_password.document_engine_db_password.result)

  database_properties = {
    identifier                   = "${local.environment_name}-db"
    username                     = "nutrient"
    db_name                      = "nutrient"
    ec2_instance_type            = "db.m8g.large"
    postgres_engine_version      = "17.5"
    postgres_parameter_family    = "postgres17"
    preferred_maintenance_window = "sun:05:00-sun:06:00"
    skip_final_snapshot          = true
    apply_immediately            = true
  }
}

resource "random_password" "document_engine_db_password" {
  length  = 60
  special = false

  keepers = {
    version = local.document_engine_db_password_version
  }
}

resource "aws_db_parameter_group" "document_engine" {
  name   = local.database_properties.identifier
  family = local.database_properties.postgres_parameter_family

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

resource "aws_db_instance" "document_engine" {
  identifier           = local.database_properties.identifier
  instance_class       = local.database_properties.ec2_instance_type
  allocated_storage    = 10
  engine               = "postgres"
  ca_cert_identifier   = "rds-ca-rsa4096-g1"
  engine_version       = local.database_properties.postgres_engine_version
  username             = local.database_properties.username
  password             = local.document_engine_db_password
  db_name              = local.database_properties.db_name
  db_subnet_group_name = module.cluster_vpc.database_subnet_group_name
  storage_encrypted    = true
  vpc_security_group_ids = [
    aws_security_group.document_engine_db_access.id
  ]
  parameter_group_name = aws_db_parameter_group.document_engine.name
  publicly_accessible  = false
  skip_final_snapshot  = local.database_properties.skip_final_snapshot
  apply_immediately    = local.database_properties.apply_immediately
}

resource "aws_security_group" "document_engine_db_access" {
  name_prefix = "${local.environment_name}-database-"
  vpc_id      = module.cluster_vpc.vpc_id
  description = "Allow access to the Document Engine database"
}

resource "aws_vpc_security_group_ingress_rule" "document_engine_db_access" {
  description                  = "Allow things in ECS to poke the database"
  security_group_id            = aws_security_group.document_engine_db_access.id
  referenced_security_group_id = module.ecs_document_engine_service.security_group_id
  ip_protocol                  = "tcp"
  from_port                    = aws_db_instance.document_engine.port
  to_port                      = aws_db_instance.document_engine.port
}
