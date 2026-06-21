import requests

# Test with a porosity image
files = {'file': open('dataset/splits/train/porosity/porosity_0000.jpg', 'rb')}
r = requests.post('http://localhost:8000/api/v1/inspections/upload', files=files)
print(f"Status Code: {r.status_code}")
print(f"Response: {r.text}")
