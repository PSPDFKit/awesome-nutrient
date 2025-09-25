# Document Engine example — setting up AWS ECS cluster and deploying Document Engine

- [Document Engine example — setting up AWS ECS cluster and deploying Document Engine](#document-engine-example--setting-up-aws-ecs-cluster-and-deploying-document-engine)
  - [Notable limitations](#notable-limitations)
  - [Prerequisites](#prerequisites)
    - [Tools](#tools)
    - [Resources](#resources)
  - [Setup](#setup)
    - [Required Variables](#required-variables)
  - [Accessing Document Engine](#accessing-document-engine)
  - [Cleanup](#cleanup)
  - [License](#license)
  - [Support, Issues and License Questions](#support-issues-and-license-questions)

> [!WARNING]
> This is not a production configuration or a building block. 
> It is intended for educational use, or as a starting point for a more complete infrastructure design.

This example demonstrates minimal installation of [Nutrient Document Engine](https://www.nutrient.io/guides/document-engine/) in AWS using Terraform.

The resources deployed will include:
 * [AWS Elastic Container Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) cluster as means of container orchestration
   * Addons to integrate Amazon resources for logging and load balancing
 * PostgreSQL database running on [AWS Relational Database Service](https://aws.amazon.com/rds/)
 * [Nutrient Document Engine](https://www.nutrient.io/guides/document-engine/)

## Notable limitations

* No S3 bucket, using `built-in` storage
* No HTTPS (requires a domain available)
* No proper secret management (plain environment variables)

## Prerequisites

### Tools

* [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Resources

You will need an AWS account, and a [profile set for it](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-using-profiles).

You can use the AWS CLI to set this up by running `aws configure --profile document-engine-example`. After running this command, the configuration wizard will guide you through setting up the profile. 

Or you can manually edit the `~/.aws/*` configuration files. 
This entails something like this in `~/.aws/credentials`:


```
[document-engine-example]
aws_access_key_id = ...
aws_secret_access_key = ...
```

## Setup

Clone this repository.

Prepare Terraform environment by setting the AWS profile and (optionally) region to use. This can be done by setting environment variables:

```shell
export TF_VAR_aws_profile_name="document-engine-example"
export TF_VAR_aws_region="eu-north-1" # Remove or change the default in `terraform.tfvars` file if setting this variable
```

Alternatively, prepare to provide AWS profile name for interactive input during the following commands.

### Required Variables

Edit `terraform.tfvars` file if necessary:

```hcl
environment_name_prefix = "your-unique-prefix"

document_engine_api_auth_token      = "your-api-auth-token"
document_engine_dashboard_username  = "admin"
document_engine_dashboard_password  = "your-secure-password"

document_engine_parameters = {
  image_tag           = "2024.9.0"
  cpu                 = 1024
  memory              = 2048
  desired_count       = 1
  logging_level       = "info"
  port                = 5000
  jwt_algorithm       = "RS256"
  jwt_public_key_path = "./JWT_PUBLIC_KEY.pem"
  extra_env           = {}
}
```

> [!NOTE]
> **Estimated monthly cost: ~$150-200** (RDS db.m8g.large + ALB + NAT Gateway)
> Consider using smaller instance types like `db.t4g.micro` for testing.

Put dependencies in place:

```shell
terraform init -upgrade
```

Next, generate a JWT key pair using the `generate-jwt-pair.sh` script

```shell
# Run from within this directory

./generate-jwt-pair.sh
```

Finally, examine the plan and apply it:

```shell
terraform plan
terraform apply
```

Output should include deployment information: 

```
...
document_engine_endpoint = "http://nutrient-de-demo-905380917.eu-north-1.elb.amazonaws.com:80"
```

## Accessing Document Engine

Terraform deployment output from the previous subsection should contain `document_engine_endpoint` string. 
It corresponds to [AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) that exposes Document Engine. 

Dashboard is accessible by `/dashboard` path, with default username `admin` and password `nutrientAdmin!`, unless you changed it.

## Cleanup

To remove the resources created above: 

```shell
terraform destroy
```

## License

This software is licensed under a [modified BSD license](LICENSE).

## Support, Issues and License Questions

Nutrient offers support via https://support.nutrient.io/hc/en-us/requests/new

Are you [evaluating our SDK](https://www.nutrient.io/sdk/try)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our sales form: https://www.nutrient.io/contact-sales?=sdk
