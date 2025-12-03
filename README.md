# Mobile Phone Price Tracker & Comparison

**[Watch Demo Video](https://drive.google.com/file/d/1UUDU1h-J2Vax0jaVvSV9UWyYJTSlwpqQ/view?usp=drivesdk)**

This project is a full-stack application designed to track and compare smartphone prices. It features a robust backend API for managing phone data and a React Native frontend for a seamless user experience.

## Repository

[https://github.com/shivank-1011/mad_project_idea.git](https://github.com/shivank-1011/mad_project_idea.git)

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v14 or higher
- **MySQL**: A running MySQL server instance.

## Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/shivank-1011/mad_project_idea.git
cd mad_project_idea
```

### 2. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open `.env` and update the `DATABASE_URL` with your MySQL credentials:
      ```env
      DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
      ```
      *Replace `USER`, `PASSWORD`, and `DATABASE_NAME` with your actual MySQL configuration.*
    - Add your `GOOGLE_API_KEY` if you intend to use the AI features.

4.  **Database Setup & Seeding:**
    - Push the Prisma schema to your database:
      ```bash
      npx prisma db push
      ```
    - **Seed the database:**
      The project includes a dataset of ~2000 phones. Run the following command to populate your database from the CSV file:
      ```bash
      npm run db:seed:csv
      ```

5.  **Start the Backend Server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000` (or the port specified in your `.env`).

### 3. Frontend Setup

1.  **Open a new terminal and navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Frontend Application:**
    ```bash
    npm start
    ```
    This will launch the Expo development server. You can run the app on an Android/iOS emulator or scan the QR code with the Expo Go app on your physical device.

## Project Structure

- **backend/**: Contains the Express.js API, Prisma ORM configuration, and seeding scripts.
    - `prisma/schema.prisma`: Defines the database schema.
    - `prisma/seed_from_csv.js`: Script to seed the database from the CSV dataset.
    - `assets/`: Stores the source CSV dataset (`mysmartprice_mobile_dataset.csv`) and static images.
- **frontend/**: Contains the React Native (Expo) application code.

