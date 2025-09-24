# Document Engine example — setting up AWS ECS cluster and deploying Document Engine

- [Document Engine example — setting up AWS ECS cluster and deploying Document Engine](#document-engine-example--setting-up-aws-ecs-cluster-and-deploying-document-engine)
  - [Notable limitations](#notable-limitations)
  - [Prerequisites](#prerequisites)
    - [Tools](#tools)
    - [Resources](#resources)
  - [Setup](#setup)
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

* No HTTPS (requires a domain available)
* No secret management (plain environment variables)
* Unverified TLS with RDS (because need to provide AWS CA certificates)

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
aws_secret_access_ke = ...
```

## Setup

Clone this repository.

Prepare Terraform environment by setting the AWS profile and (optionally) region to use. This can be done by setting environment variables:

```shell
export TF_VAR_aws_profile_name="document-engine-example"
export TF_VAR_aws_region="eu-north-1" # Remove or change the default in `terraform.tfvars` file if setting this variable
```

Alternatively, prepare to provide AWS profile name for interactive input during the following commands. 

Put dependencies in place:

```shell
terraform init -upgrade
```

Next, generate a JWT key pair using the `generate-jwt-pair.sh` script

```shell
# Run from within examples/de-aws-eks

../../scripts/generate-jwt-pair.sh
```

Finally, examine the plan and apply it:

```shell
terraform plan
terraform apply
```

Output should include deployment information: 

```
...
environment_name = "pspdfkit-de-demo-fE0JX8Bf"
cluster_vpc_id = "vpc-0d00dfe0eee0641e4"
...
document_engine_url = "http://k8s-pspdfkit-document-1828531825-23172973189273.eu-north-1.elb.amazonaws.com"
kubeconfig_command = "aws eks update-kubeconfig --region eu-north-1 --name pspdfkit-de-demo-fsd797d --kubeconfig .kubeconfig"
```

Note `kubeconfig_command` output, it contains AWS CLI command to retrieve Kubernetes configuration file. It can then be used by setting `KUBECONFIG` environment variable: 

```shell
aws eks update-kubeconfig --region eu-north-1 --name pspdfkit-de-demo-fsd797d --kubeconfig .kubeconfig
export KUBECONFIG="$(pwd)/.kubeconfig"
```

This allows all range of `kubectl` and `helm` commands: 

```shell
kubectl get namespaces
helm status -n pspdfkit-document-engine document-engine
```

We will need the URL from 

## Accessing Document Engine

Terraform deployment output from the previous subsection should contain `document_engine_url` string. 
It corresponds to [AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) that exposes Document Engine. 

Dashboard is accessible by `/dashboard` path, with default username `admin` and password `admin`.

## Cleanup

To remove the resources created above: 

```shell
terraform destroy
```

## License

This software is licensed under a [modified BSD license](LICENSE).

## Support, Issues and License Questions

PSPDFKit offers support for customers with an active SDK license via https://pspdfkit.com/support/request/

Are you [evaluating our SDK](https://pspdfkit.com/try/)? That's great, we're happy to help out! To make sure this is fast, please use a work email and have someone from your company fill out our sales form: https://pspdfkit.com/sales/

