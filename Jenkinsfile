pipeline {
  agent any

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose up --build -d'
      }
    }
  }

  post {
    success {
      echo '🚀 App deployed'
    }
    failure {
      echo '❌ Build failed'
    }
  }
}