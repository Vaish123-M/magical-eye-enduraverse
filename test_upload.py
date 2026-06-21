import requests

# Test the upload endpoint with a synthetic image
files = {'file': open('dataset/splits/train/OK/OK_0000.jpg', 'rb')}
r = requests.post('http://localhost:8000/api/v1/inspections/upload', files=files)
print(f"Status Code: {r.status_code}")
print(f"Response: {r.text}")
