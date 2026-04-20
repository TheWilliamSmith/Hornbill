module "hornbill_api_ecr" {
  source              = "./ecr"
  ecr_repository_name = "hornbill-api-docker-repo"
}

module "hornbill_app_ecr" {
  source              = "./ecr"
  ecr_repository_name = "hornbill-app-docker-repo"
}
