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
        sh '''
        cd $WORKSPACE

        echo "PORT=5000" > .env
        echo "MONGO_URI=mongodb://host.docker.internal:27017/frauddb" >> .env
        echo "JWT_SECRET=superdupersecret" >> .env
        echo "GITHUB_CLIENT_ID=YOUR_ID" >> .env
        echo "GITHUB_CLIENT_SECRET=YOUR_SECRET" >> .env
        echo "GITHUB_CALLBACK_URL=http://localhost:8080/auth/github/callback" >> .env
        echo "ML_SERVICE_URL=http://ml-service:8000/predict" >> .env

        docker compose down
        docker compose up --build -d
        '''
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