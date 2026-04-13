# ImageURL Generator

ImageURL Generator is a simple web application that allows users to upload photos and instantly receive live URLs to their exact images. The application is built with Angular for the frontend and ASP.NET Core Web API for the backend, leveraging Cloudinary API for image hosting and URL generation. It also supports Google login authentication and payment integration via Mpesa and Stripe.

## Features

- Upload images and get live URLs
- Secure and scalable backend
- Modern Angular frontend
- Cloudinary integration for image hosting
- SQL Server database for persistence
- Google login authentication
- Payment integration with Mpesa and Stripe
- Dockerized for easy deployment
- Ready for deployment on Render

## Technologies Used

- **Frontend:** Angular
- **Backend:** ASP.NET Core Web API
- **Database:** SQL Server
- **Image Hosting:** Cloudinary API
- **Authentication:** Google OAuth
- **Payments:** Mpesa, Stripe
- **Containerization:** Docker, Docker Compose
- **Deployment:** Render

## Folder Structure

```
ImageURLGenerator/
├── backend/
│   └── src/
│       ├── Controllers/
│       ├── Data/           # DbContext and migrations
│       ├── Dtos/
│       ├── Models/
│       ├── Repositories/
│       ├── RepositoryResult/
│       ├── Validators/
│       └── ...
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   ├── services/
│       │   ├── guards/
│       │   ├── pipes/
│       │   ├── interfaces/
│       │   └── ...
│       └── assets/
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js & npm
- .NET SDK
- Docker & Docker Compose
- SQL Server (local or containerized)
- Cloudinary account & API credentials
- Google OAuth credentials
- Mpesa and Stripe API credentials

### Setup

1. **Clone the repository**
  ```bash
  git clone https://github.com/Xhechar/ImageUG-App.git
  cd imageurl-generator
  ```

2. **Configure Environment Variables**
  - Backend: Add Cloudinary, SQL Server, Google OAuth, Mpesa, and Stripe credentials to `appsettings.json` or environment variables.
  - Frontend: Add Cloudinary and Google API keys if needed.

3. **Run with Docker Compose**
  ```bash
  docker-compose up --build
  ```

4. **Access the Application**
  - Placeholder URL: [http://localhost:4200](http://localhost:4200)

## API Endpoints

- `POST /api/images/upload` - Upload an image and get its URL
- `GET /api/images/{id}` - Retrieve image details
- `POST /api/auth/google` - Google login
- `POST /api/payments/mpesa` - Mpesa payment
- `POST /api/payments/stripe` - Stripe payment

## Deployment

- The application is ready for deployment on [Render](https://render.com).
- Placeholder URL will be updated after deployment.

## License

XHR

## Author

xhechar .
