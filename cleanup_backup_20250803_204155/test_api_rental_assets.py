import requests
import json

BASE_URL = "http://localhost:5000"  # Update this if your Flask app runs on a different port

def test_rental_assets_api():
    """Test the rental assets API endpoints"""
    print("Testing rental assets API endpoints...")

    # Test GET all rental assets
    print("\n1. Testing GET all rental assets")
    try:
        response = requests.get(f"{BASE_URL}/rental/api/rental-assets")
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            assets = response.json().get('assets', [])
            print(f"Found {len(assets)} rental assets")
            if assets:
                print("First asset:", json.dumps(assets[0], indent=2))
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Error: {e}")

    # Test GET available rental assets
    print("\n2. Testing GET available rental assets")
    try:
        response = requests.get(f"{BASE_URL}/rental/api/rental-assets/available")
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            assets = response.json().get('assets', [])
            print(f"Found {len(assets)} available rental assets")
            if assets:
                print("First available asset:", json.dumps(assets[0], indent=2))
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Error: {e}")

    # Test GET specific rental asset
    print("\n3. Testing GET specific rental asset")
    asset_id = 1  # Change this to a valid asset ID in your database
    try:
        response = requests.get(f"{BASE_URL}/rental/api/rental-assets/{asset_id}")
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            asset = response.json()
            print("Asset details:", json.dumps(asset, indent=2))
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Error: {e}")

    print("\nAPI testing complete!")

if __name__ == "__main__":
    # Make sure your Flask app is running before executing this test
    test_rental_assets_api()
