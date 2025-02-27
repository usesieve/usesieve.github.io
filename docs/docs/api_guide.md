
# Sieve API Quick Start Guide

This notebook demonstrates how to use the Sieve API to extract structured data from various document types. We'll cover three common use cases:

1. Extracting data points from a PDF
2. Analyzing financial documents with specific parameters
3. Mapping credit card transactions to merchant stock tickers



```python
import requests
import json
import time

# API configuration
BASE_URL = 'https://api.usesieve.com' 
# Authentication credentials
email = "your.email@example.com"
password = "your_password"
user_type = "requester"
full_name = "Tutorial User"
```

### If you don't have an account yet, register one


```python
registration_response = requests.post(f"{BASE_URL}/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "user_type": user_type,
        "full_name": full_name
    })
registration_response.json()
```




    {'token': 'eyJhbGciOiAiUlMyNTYiLCAidHlwIjogIkpXVCIsICJraWQiOiAiOTQ0YmZiYzg4MTkwNjY3ZjgwMjllZDRiOWQ4OWZmNGMyMzM1YWY1NSJ9.eyJpc3MiOiAiNTAxNzY0MjgzMTM1LWNvbXB1dGVAZGV2ZWxvcGVyLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAic3ViIjogIjUwMTc2NDI4MzEzNS1jb21wdXRlQGRldmVsb3Blci5nc2VydmljZWFjY291bnQuY29tIiwgImF1ZCI6ICJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsICJ1aWQiOiAiN0tLZzA1MXU5c2ZOZEtlbzJFd2dqT3JHNkV4MiIsICJpYXQiOiAxNzM5OTgxODQ4LCAiZXhwIjogMTczOTk4NTQ0OH0.kiLTVP6SRJSbNJH1HQ3BtDKMNfOUneRWModCwz22O5B4wKMS51TmfJMUlgdAc6eFUB1Jbp2tQjb7fY3s4MOwl4TnV1UCQ18BH0-b3wJh6bad0DXtSKbTIADvKkvJtJupGxWf5ErCV3lw6XN9npz4cukngw_-YGrj4YXd97tPnMjZxXG6GPEwxGEF5keQjyLdO2e5T35tUGnXcI-TzNtLQUenyo_3LF31vAPwJl2Oz7f6mLpeejQPcwvmN1Pj9DggiUSiuQLPgB7njShcSlebiOwoEqW38X3UfcM0-03GGYdPuJuQ7THvbfks1HGFFQzqIMX4nHGF21rq3CymmqMHaw',
     'user_id': '7KKg051u9sfNdKeo2EwgjOrG6Ex2',
     'user_type': 'requester'}



### If you have an account, log in to get an authentication token


```python
login_result = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
if login_result.status_code == 200:
    print("Login successful!")
elif login_result.status_code != 200:
    print("Login failed. Check your credentials again.")
# Save the token for future API calls
token = login_result.json().get('token')
# Set the token in your header
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
```

    Login successful!


## Helper Functions

Let's define some helper functions to interact with the API and check job status.


```python
def submit_job(document_type, content, metadata=None):
    url = f'{BASE_URL}/process'
    payload = {
        'document_type': document_type,
        'content': content,
        'metadata': metadata or {}
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()

def check_job_status(job_id):
    url = f'{BASE_URL}/status/{job_id}'
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def wait_for_completion(job_id, max_attempts=30, delay=60):
    for _ in range(max_attempts):
        status = check_job_status(job_id)
        if status['status'] == 'completed':
            return status
        elif status['status'] == 'failed':
            raise Exception(f'Job failed: {status.get("error", "Unknown error")}')
        time.sleep(delay)
    raise TimeoutError('Job did not complete within the expected time')
```

## Example 1: Extract Data from PDF

Let's extract specific data points from a PDF document.


```python
response = requests.post(f'{BASE_URL}/api/v1/process', headers=headers, json={
    "document_type": "pdf",
    "metadata": {
        "url": "https://www.cecafe.com.br/site/wp-content/uploads/2023/03/CECAFE-Monthly-Coffee-Report-JANUARY-2025.pdf",
        'data_points': ['Coffee export volume in most recent period (USD)']
    }
})
response.raise_for_status()
job_id = response.json().get("job_id")
print("job id: ", job_id)

# # Wait for completion and get results
# final_result = wait_for_completion(result['job_id'])
# print(json.dumps(final_result, indent=2))
```

    job id:  t1mPRc2JtlCKYtia1uPg


### Check for results


```python
url = f'{BASE_URL}/api/v1/status/{job_id}'
response = requests.get(url, headers=headers)
response.raise_for_status()
response.json()
print("status:", response.json().get("status"))
if response.json().get("status") == "completed":
    print("response:", response.json().get("ai_result").get("result"))
```

    status: completed
    response: {'Coffee export volume in most recent period (USD)': '1,315,849.2'}


## Example 2: Financial Document Analysis

Extract specific financial data points from SEC filings or other financial documents.


```python
response = requests.post(f'{BASE_URL}/api/v1/process', headers=headers, json={
    "document_type": "sec",
    "content": "None",
    "metadata": {
        'ticker': 'AAPL',
        'metrics': ["geographic distribution of revenue"]
    }
})
response.raise_for_status()
job_id = response.json().get("job_id")
print("job id: ", job_id)


```

    job id:  5pwVuIuEm3ybBvTBBHcx



```python
url = f'{BASE_URL}/api/v1/status/{job_id}'
response = requests.get(url, headers=headers)
response.raise_for_status()
response.json()
print("status:", response.json().get("status"))
if response.json().get("status") == "completed":
    print("response:", response.json().get("ai_result").get("result"))
```

    status: completed
    response: {'revenue_by_geography': None}


## Example 3: Credit Card Transaction Mapping

Map a credit card transaction description to a merchant's stock ticker.


```python
response = requests.post(f'{BASE_URL}/api/v1/process', headers=headers, json={
    "document_type": "credit_card",
    "metadata" : {
        "transaction": "WHOLEFDS MKT 10259 AUSTIN TX",
        'transaction_date': '2024-01-15',
        'amount': 156.78,
        "data_points": ["merchant stock ticker"]
    }
})
response.raise_for_status()
job_id = response.json().get("job_id")
print("job id: ", job_id)



```

    job id:  synGikSyt7Tpiag6S6OE



```python
# Wait for completion and get results
final_result = wait_for_completion(result['job_id'])
print(json.dumps(final_result, indent=2))
```
