provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "terraform_demo" {
  ami                    = "ami-0b5a4e51202cd98e5"
  instance_type          = "t3.micro"
  availability_zone      = "us-east-1c"
  
  # מזהה חומת האש החדש שיצרת
  vpc_security_group_ids = ["sg-05d6cb41399688047"] 
  
  # שם המפתח שלך
  key_name               = "eliad-key" 

  tags = {
    Name = "TerraformOS"
  }
}

output "instance_ip" {
  value = aws_instance.terraform_demo.public_ip
}
