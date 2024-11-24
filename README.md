### Meetshop Backend Test

##### Installation

```
pnpm install
```
##### Run Tests

```
pnpm test:coverage
```


##### Q1: Binary Tree Inversion


######  Process Example

輸入: `[5, 3, 8, 1, 7, 2, 6]`

1. Array to Tree：
```
     5
   /   \
  3     8
 / \   / \
1   7 2   6
```

2. Inversion：
```
     5
   /   \
  8     3
 / \   / \
6   2 7   1
```

3. Tree to Array：
```
[5, 8, 3, 6, 2, 7, 1]
```



##### Q2: Banking System

###### Start Server

```
# Start server
pnpm start

# Development mode with auto-reload
pnpm dev
```

###### Docker Support

```
# Build Docker image
docker build -t banking-system .

# Run Docker container
docker run -p 3000:3000 banking-system
```

###### Implementation

```js
POST /accounts         - Create new account
GET /accounts/:id      - Get account details
POST /accounts/deposit - Deposit money
POST /accounts/withdraw- Withdraw money
POST /transfer        - Transfer between accounts
```

###### API Testing

You can test the API endpoints using curl commands:

###### Create Account
```
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Account",
    "initialBalance": 1000
  }'
```

###### Get Account Details
```
curl http://localhost:3000/accounts/{accountId}
```

###### Deposit Money

```
curl -X POST http://localhost:3000/accounts/{accountId}/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500
  }'
```

###### Withdraw Money

```
curl -X POST http://localhost:3000/accounts/{accountId}/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200
  }'
```

###### Transfer Money

```
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "account1Id",
    "toAccountId": "account2Id",
    "amount": 300
  }'
```# Meetshop-Backend-Test
