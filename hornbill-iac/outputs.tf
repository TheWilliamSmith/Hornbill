output "hornbill_app_ecr" {
    description = "The URL of the ECR repository for the Hornbill app."
    value       = module.hornbill_app_ecr.repository_url
}

output "hornbill_api_ecr" {
    description = "The URL of the ECR repository for the Hornbill API."
    value       = module.hornbill_api_ecr.repository_url
}