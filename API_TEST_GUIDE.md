# 🛒 E-commerce API v1 - Ultimate Test Guide

This guide contains EVERY endpoint available in the system, organized by resource.

## 🌐 Base URL
`http://localhost:3000/api/v1`

---

## 🔐 Authentication & Authorization

### 1. Register (Public - User only)
- **POST /auth/register**
- **JSON Body:**
```json
{
  "fullName": "Pham Son",
  "email": "son_user@gmail.com",
  "password": "password123"
}
```

### 2. Login (Public - Get Token)
- **POST /auth/login**
- **JSON Body:**
```json
{
  "email": "admin@gmail.com", 
  "password": "123456"
}
```
- **Action:** Copy `token` -> Use as **Bearer Token** in all other requests.

---

## 📂 Categories (CRUD)

### Create Category (Admin Only)
- **POST /categories**
```json
{
  "name": "Laptops",
  "description": "Gaming and office laptops"
}
```

### Update Category (Admin Only)
- **PUT /categories/:id**
```json
{
  "description": "Premium Gaming and Ultrabooks"
}
```

### Delete Category (Admin Only)
- **DELETE /categories/:id**
- **Rule:** Fails if products are linked to this category.

### Get All / Get By ID
- **GET /categories**
- **GET /categories/:id**

---

## 📱 Products (CRUD)

### Create Product (Admin Only)
- **POST /products**
```json
{
  "name": "ASUS ROG Zephyrus G14",
  "description": "High performance gaming laptop",
  "price": 1599.99,
  "stock": 10,
  "categoryId": "PASTE_ID_HERE"
}
```

### Update Product (Admin Only)
- **PUT /products/:id**
```json
{
  "price": 1499.99,
  "stock": 15
}
```

### Delete Product (Admin Only)
- **DELETE /products/:id**

---

## 🛒 Orders (Transactions)

### Create Order (Checkout)
- **POST /orders**
- **Rule:** Atomic transaction. Decrements stock & inventory.
```json
{
  "userId": "PASTE_USER_ID_HERE",
  "totalAmount": 1499.99,
  "orderItems": [
    {
      "productId": "PASTE_PROD_ID_HERE",
      "quantity": 1,
      "price": 1499.99
    }
  ]
}
```

### Update Order Status
- **PUT /orders/:id/status**
```json
{
  "status": "DELIVERED"
}
```

---

## 🛖 Inventory (Admin Only)

### Update Inventory
- **PUT /inventory/:id**
```json
{
  "quantity": 120,
  "location": "Warehouse B - Shelf 5"
}
```

---

## 👥 Users

### Update User Profile
- **PUT /users/:id**
```json
{
  "fullName": "Pham Son Updated",
  "password": "newpassword456"
}
```

### Delete User
- **DELETE /users/:id**

---

## 💬 Messaging (Private Chat)

Messaging allows users to communicate privately.

### 1. Send Message
- **POST /messages**
```json
{
  "to": "RECIPIENT_USER_ID",
  "messageContent": {
    "type": "text",
    "text": "Hello, how are you?"
  }
}
*vd*
{
  "to": "69ce96019a31f6896ffc9a7e",
  "messageContent": {
    "type": "file",
    "text": "C:/Users/LENOVO/Downloads/tc2.side"
  }
}

```
*Note: For files, set `type` to "file" and `text` to the file path.*

### 2. Get Conversation
- **GET /messages/:userID**
- **Purpose:** Get all messages between the current user and the specified user ID.

### 3. Get Chat List (Inbox)
- **GET /messages**
- **Purpose:** Get the most recent message from every user you've had a conversation with.

---

## 🛡️ Business Rules & Security (Quick Reference)
1. **Uniqueness:** Categories cannot have duplicate names.
2. **Safety:** Cannot delete categories that still have products.
3. **Stock:** Orders block if `quantity > stock`.
4. **Automation:** Products auto-generate Inventory entry on create.
5. **Prices:** Must be `> 0`.
6. **Ownership (USER):** Users can only see/update/delete **THEIR OWN** Profile and Orders. Attempting to access others results in `403 Forbidden`.
7. **Admins:** Have full access to all users, orders, inventory, and management endpoints.
8. **User List:** Only Admins can call `GET /api/v1/users` to see everyone.

## 🛠 Admin Credentials
- **Email:** `admin@gmail.com`
- **Password:** `123456`
