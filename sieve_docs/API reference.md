# API Reference

## Refistration and Login

### Register as a new user

####requests.post
Send a POST request to the registration endpoint to create a new user account.

```python
requests.post(
    https://api.sieve.ai/api/vs/authregister",
    json={
        "email": "your.email@example.com",
        "password": "your_password",
        "user_type": "requester",
        "full_name": "Tutorial User"
    }
)
```

### `login_user`
