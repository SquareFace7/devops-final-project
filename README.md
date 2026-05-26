# DevOps Final Project: Automated CI/CD Pipeline for Web Server Provisioning

**Author:** Eliad Hagag

## Overview
This project demonstrates a complete, automated end-to-end CI/CD pipeline. It provisions cloud infrastructure on AWS, configures the server environment, and deploys a web application (Flappy Bird) completely hands-free. The entire workflow is orchestrated using Jenkins, with Infrastructure as Code (IaC) handled by Terraform, and configuration management executed by Ansible.

## Technologies & Tools Used
* **AWS (Amazon Web Services):** Cloud provider for hosting the EC2 instance, Security Groups, and Networking.
* **Terraform:** Infrastructure as Code (IaC) tool used to provision the AWS EC2 instance (t3.micro) and apply security parameters.
* **Ansible:** Configuration management tool used to install required packages (Apache HTTPD, Git, **Node.js v20**), build the application, and deploy the production-ready code to the web server.
* **Jenkins:** CI/CD automation server running in a Docker container to orchestrate the pipeline stages.
* **Docker:** Containerization platform used to run the isolated Jenkins environment.
* **GitHub:** Source Code Management (SCM) for version control.

## Pipeline Architecture (Jenkinsfile)
The pipeline is fully parameterized, allowing the user to select the desired action (`apply` to build, or `destroy` to tear down the infrastructure) before running.

The build pipeline consists of the following automated stages:
* **Checkout SCM:** Pulls the latest infrastructure and configuration code from GitHub.
* **Terraform Init:** Initializes the Terraform backend and AWS provider.
* **Terraform Action:** Provisions the AWS EC2 instance dynamically based on the selected region (us-east-1) and updated AMI. Extracts the new public IP address.
* **Run Ansible Playbook:** Connects to the newly created EC2 instance via SSH and runs `instance.yml` to set up the web server, clone the repository, install npm dependencies, and build the Node.js application.
* **Website Validation:** Automatically runs an HTTP check (cURL) against the new server to ensure it returns a 200 OK status, confirming successful deployment.
* **Post Actions:** Cleans up temporary inventory files and outputs the final live URL for the application.

## Prerequisites
To run this pipeline, the following credentials must be configured in Jenkins:
* `aws-credentials-global`: AWS Access Key and Secret Key for Terraform authentication.
* `aws-ssh-key`: The private `.pem` SSH key for Ansible to authenticate into the created EC2 instance.

## Live Deployment
Upon a successful build, Jenkins outputs the dynamic IP address. The application can be accessed via:
`http://<EC2_PUBLIC_IP>/index.html`
