#!/usr/bin/env python3
"""
Backend API Testing for BLZE Cannabis E-commerce Platform
Tests image upload, product update, and static file serving functionality
"""

import requests
import json
import os
import tempfile
from PIL import Image
import io

# Configuration
BACKEND_URL = "https://a72bd55c-4478-4952-8f96-3344a97b4ae3.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"
ADMIN_TOKEN = "admin_token"
TEST_PRODUCT_ID = "dante-inferno-001"

# Headers for authenticated requests
AUTH_HEADERS = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

def create_test_image():
    """Create a test JPEG image for upload testing"""
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_image_upload_api():
    """Test POST /api/admin/upload endpoint"""
    print("\n=== Testing Image Upload API ===")
    
    try:
        # Create test image
        test_image = create_test_image()
        
        # Prepare files for upload
        files = {
            'file': ('test_image.jpeg', test_image, 'image/jpeg')
        }
        
        # Remove Content-Type from headers for file upload
        upload_headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        
        # Make upload request
        response = requests.post(
            f"{API_BASE}/admin/upload",
            headers=upload_headers,
            files=files
        )
        
        print(f"Upload Response Status: {response.status_code}")
        print(f"Upload Response: {response.text}")
        
        if response.status_code == 200:
            upload_data = response.json()
            image_url = upload_data.get('url')
            print(f"✅ Image uploaded successfully: {image_url}")
            return image_url
        else:
            print(f"❌ Image upload failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Image upload error: {str(e)}")
        return None

def test_static_file_serving(image_url):
    """Test if uploaded images are accessible via static file serving"""
    print("\n=== Testing Static File Serving ===")
    
    if not image_url:
        print("❌ No image URL to test")
        return False
    
    try:
        # Test accessing the uploaded image
        full_image_url = f"{BACKEND_URL}{image_url}"
        print(f"Testing image access at: {full_image_url}")
        
        response = requests.get(full_image_url)
        print(f"Static file response status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Not specified')}")
        print(f"Content-Length: {response.headers.get('content-length', 'Not specified')}")
        
        if response.status_code == 200:
            print("✅ Static file serving works correctly")
            return True
        else:
            print(f"❌ Static file serving failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Static file serving error: {str(e)}")
        return False

def test_product_update_api(image_url):
    """Test PUT /api/admin/products/{id} endpoint with image URLs"""
    print("\n=== Testing Product Update API ===")
    
    try:
        # First, get the current product
        response = requests.get(f"{API_BASE}/products/{TEST_PRODUCT_ID}")
        print(f"Get product response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Failed to get product: {response.status_code}")
            return False
        
        current_product = response.json()
        print(f"Current product images: {current_product.get('images', [])}")
        
        # Update product with new image
        if image_url:
            current_product['images'] = [f"{BACKEND_URL}{image_url}"]
        else:
            current_product['images'] = ["https://example.com/test-image.jpg"]
        
        # Make update request
        response = requests.put(
            f"{API_BASE}/admin/products/{TEST_PRODUCT_ID}",
            headers=AUTH_HEADERS,
            json=current_product
        )
        
        print(f"Update response status: {response.status_code}")
        print(f"Update response: {response.text}")
        
        if response.status_code == 200:
            updated_product = response.json()
            print(f"✅ Product updated successfully")
            print(f"Updated images: {updated_product.get('images', [])}")
            return True
        else:
            print(f"❌ Product update failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Product update error: {str(e)}")
        return False

def test_data_persistence():
    """Test if changes are persisted to products.json"""
    print("\n=== Testing Data Persistence ===")
    
    try:
        # Check if products.json file exists and contains updated data
        products_file = "/app/backend/products.json"
        
        if not os.path.exists(products_file):
            print(f"❌ Products file not found: {products_file}")
            return False
        
        with open(products_file, 'r') as f:
            products = json.load(f)
        
        # Find our test product
        test_product = next((p for p in products if p["id"] == TEST_PRODUCT_ID), None)
        
        if not test_product:
            print(f"❌ Test product {TEST_PRODUCT_ID} not found in products.json")
            return False
        
        print(f"Product images in file: {test_product.get('images', [])}")
        
        if test_product.get('images'):
            print("✅ Images are persisted to products.json")
            return True
        else:
            print("❌ Images are not persisted to products.json")
            return False
            
    except Exception as e:
        print(f"❌ Data persistence check error: {str(e)}")
        return False

def test_integration_flow():
    """Test the complete integration flow"""
    print("\n=== Testing Complete Integration Flow ===")
    
    # Step 1: Upload image
    image_url = test_image_upload_api()
    
    # Step 2: Test static file serving
    static_serving_works = test_static_file_serving(image_url)
    
    # Step 3: Update product with image
    product_update_works = test_product_update_api(image_url)
    
    # Step 4: Check data persistence
    data_persisted = test_data_persistence()
    
    # Summary
    print("\n=== Integration Flow Summary ===")
    print(f"Image Upload: {'✅' if image_url else '❌'}")
    print(f"Static File Serving: {'✅' if static_serving_works else '❌'}")
    print(f"Product Update: {'✅' if product_update_works else '❌'}")
    print(f"Data Persistence: {'✅' if data_persisted else '❌'}")
    
    return all([image_url, static_serving_works, product_update_works, data_persisted])

def test_file_system_analysis():
    """Analyze file system to understand the upload issue"""
    print("\n=== File System Analysis ===")
    
    try:
        # Check different upload directories
        directories_to_check = [
            "/app/uploads/",
            "/app/backend/uploads/",
            "uploads/"
        ]
        
        for directory in directories_to_check:
            if os.path.exists(directory):
                files = os.listdir(directory)
                print(f"Directory {directory}: {len(files)} files")
                if files:
                    print(f"  Sample files: {files[:3]}")
            else:
                print(f"Directory {directory}: Does not exist")
        
        # Check current working directory
        print(f"Current working directory: {os.getcwd()}")
        
        # Check if backend is running from correct directory
        backend_main_path = "/app/backend/main.py"
        if os.path.exists(backend_main_path):
            print(f"Backend main.py found at: {backend_main_path}")
        
    except Exception as e:
        print(f"❌ File system analysis error: {str(e)}")

def main():
    """Run all tests"""
    print("🧪 BLZE Cannabis Backend API Testing")
    print("=" * 50)
    
    # Basic connectivity test
    try:
        response = requests.get(f"{API_BASE}/products")
        print(f"API connectivity: {'✅' if response.status_code == 200 else '❌'}")
    except Exception as e:
        print(f"❌ API connectivity failed: {str(e)}")
        return
    
    # File system analysis
    test_file_system_analysis()
    
    # Run integration flow test
    success = test_integration_flow()
    
    print(f"\n🎯 Overall Test Result: {'✅ PASS' if success else '❌ FAIL'}")

if __name__ == "__main__":
    main()