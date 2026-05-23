pipeline {
    agent any
    
    // מאפשר לבחור בין הקמה למחיקה בהרצה ידנית (Build with Parameters)
    parameters {
        choice(name: 'ACTION', choices: ['apply', 'destroy'], description: 'בחר האם להקים או למחוק את התשתית')
    }

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
    }

    stages {
        stage('Checkout') {
            steps {
                // מוריד את הקוד מה-Repository
                checkout scm
            }
        }
        
        stage('Terraform Init') {
            steps {
                sh 'terraform init'
            }
        }

        stage('Terraform Action') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-credentials-global', 
                                                 passwordVariable: 'AWS_SECRET_ACCESS_KEY', 
                                                 usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                    script {
                        if (params.ACTION == 'apply') {
                            sh 'terraform apply -auto-approve'
                        } else {
                            sh 'terraform destroy -auto-approve'
                        }
                    }
                }
            }
        }

        stage('Run Ansible Playbook') {
            // השלב הזה ירוץ רק אם בחרנו להקים את המכונה (apply)
            when { expression { params.ACTION == 'apply' } }
            steps {
                script {
                    // שליפת ה-IP מטרפורם
                    def instanceIp = sh(script: "terraform output -raw instance_ip", returnStdout: true).trim()
                    
                    // יצירת קובץ אינוונטורי זמני
                    writeFile file: 'inventory_fixed.ini', text: "[all]\n${instanceIp}"
                    
                    // הרצת Ansible עם המפתח מה-Credentials
                    withCredentials([sshUserPrivateKey(credentialsId: 'aws-ssh-key', 
                                                     keyFileVariable: 'SSH_KEY', 
                                                     usernameVariable: 'SSH_USER')]) {
                        sh """
                            export ANSIBLE_CONFIG=./ansible.cfg
                            export ANSIBLE_HOST_KEY_CHECKING=False
                            ansible-playbook -i inventory_fixed.ini instance.yml \
                            --user ${SSH_USER} \
                            --private-key ${SSH_KEY}
                        """
                    }
                }
            }
        }

        // --- השלב החדש שהוספנו: ולידציה של האתר ---
        stage('Website Validation') {
            when { expression { params.ACTION == 'apply' } }
            steps {
                script {
                    def instanceIp = sh(script: "terraform output -raw instance_ip", returnStdout: true).trim()
                    echo "Checking if the website is up and running at http://${instanceIp}/web/index.html ..."
                    
                    sh """
                        # ממתינים 10 שניות כדי לתת לשרת ה-Web לעלות באופן מלא
                        sleep 10
                        
                        # מבצעים קריאה לאתר ובודקים את קוד התגובה
                        HTTP_STATUS=\$(curl -o /dev/null -s -w "%{http_code}\n" http://${instanceIp}/web/index.html)
                        
                        if [ "\$HTTP_STATUS" -eq 200 ]; then
                            echo "Validation PASSED! Received HTTP Status: 200 OK"
                        else
                            echo "Validation FAILED! Received HTTP Status: \$HTTP_STATUS"
                            exit 1
                        fi
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                // הצגת הכתובת רק אם המכונה הוקמה בהצלחה
                if (params.ACTION == 'apply') {
                    def finalIp = sh(script: "terraform output -raw instance_ip", returnStdout: true).trim()
                    echo "-----------------------------------------------------------"
                    echo "DEPLOYMENT SUCCESSFUL!"
                    echo "New VM IP Address: ${finalIp}"
                    // עדכנו כאן את הסיומת ל-html
                    echo "Web URL: http://${finalIp}/web/index.html"
                    echo "-----------------------------------------------------------"
                } else {
                    echo "-----------------------------------------------------------"
                    echo "INFRASTRUCTURE DESTROYED SUCCESSFULLY"
                    echo "-----------------------------------------------------------"
                }
            }
        }
        always {
            // ניקוי קבצים זמניים
            sh 'rm -f inventory_fixed.ini'
        }
    }
}