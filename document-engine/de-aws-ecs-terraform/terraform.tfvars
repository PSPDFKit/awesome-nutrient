environment_name_prefix = "nutrient-demo"

# Document Engine

document_engine_activation_key = null
document_engine_parameters = {
  image_tag     = "1.11.0"
  logging_level = "info"
  cpu           = 2048
  memory        = 4096
  port          = 5000
  extra_env = {
    PSPDFKIT_WORKER_POOL_SIZE = "8"
  }
}

# AWS

aws_region = "eu-north-1"

# Names and resources

environment_name = "nutrient-de-demo"
additional_tags = {
  "nutrient:environment" = "nutrient-de-demo"
  "nutrient:demo"        = "true"
}
