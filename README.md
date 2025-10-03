# Movie Watchlist API (JWT)

A simple RESTful API for managing a personal movie watchlist with JWT authentication.

---

## Setup

1. **Clone the repository:**
  ```sh
  git clone https://github.com/ebinvalickal/movie-watchlist-api-jwt.git
  cd movie-watchlist-api-jwt
  ```

2. **Install dependencies:**
  ```sh
  npm install
  ```

3. **Run the server:**
  ```sh
  npm start
  ```
  The server will start at `http://localhost:5000`.

---

## Base URL
```
http://localhost:5000/api
```

## Authentication
- Register and login to receive a JWT token.
- Pass the token in the `Authorization` header as `Bearer <token>` for protected endpoints.

---

## Endpoints

### 1. Register
- **URL:** `/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `201 Created` `{ "message": "User registered successfully" }`
  - `400 Bad Request` `{ "error": "Username already exists" }`

### 2. Login
- **URL:** `/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:**
  - `200 OK` `{ "token": "<jwt>" }`
  - `401 Unauthorized` `{ "error": "Invalid credentials" }`

### 3. Get Watchlist
- **URL:** `/watchlist`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Response:**
  - `200 OK` `[{ ...movie }]`

### 4. Add Movie to Watchlist
- **URL:** `/watchlist`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Body:**
  ```json
  {
    "tmdb_id": "number",
    "title": "string",
    "year": "string (optional)",
    "poster": "string (optional)"
  }
  ```
- **Response:**
  - `201 Created` `{ "id": number, "tmdb_id": number, "title": string, "year": string, "poster": string }`
  - `400 Bad Request` `{ "error": "Movie details required" }`

### 5. Delete Movie from Watchlist
- **URL:** `/watchlist/:id`
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <jwt>`
- **Response:**
  - `200 OK` `{ "message": "Movie deleted successfully" }`
  - `404 Not Found` `{ "error": "Movie not found" }`

