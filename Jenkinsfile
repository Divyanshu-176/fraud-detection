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

        # 🔥 Create .env dynamically
        echo "SHARED_ANALYTICS=true" > .env
        echo "MONGO_URI=mongodb://host.docker.internal:27017/fraud-detection" >> .env
        echo "ML_SERVICE_URL=http://ml-service:8000/predict" >> .env
        echo "JWT_SECRET=superdupersecret" >> .env

        echo "GITHUB_CLIENT_ID=Ov23liY7ioD3A2eAGahi" >> .env
        echo "GITHUB_CLIENT_SECRET=bac1d0a210b812d1d576420984ffd46ec6b1e22a" >> .env

        echo "GITHUB_CALLBACK_URL=https://dispersal-scrunch-shopper.ngrok-free.dev/auth/github/callback" >> .env
        echo "FRONTEND_URL=https://dispersal-scrunch-shopper.ngrok-free.dev" >> .env

        # 🔄 Restart containers
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