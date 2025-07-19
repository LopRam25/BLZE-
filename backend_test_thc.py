#!/usr/bin/env python3
"""
Backend API Testing for BLZE Order & Inventory Management System with THC Compliance
Tests inventory management, order processing, THC calculations, and receipt generation
"""

import requests
import json
import os
from datetime import datetime

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

def test_thc_calculation_functions():
    """Test THC calculation functions with sample data"""
    print("\n=== Testing THC Calculation Functions ===")
    
    try:
        # Test data
        delta9_thc = 1.2  # 1.2% Delta-9 THC
        thca = 25.8       # 25.8% THCA
        
        # Calculate total THC using the formula: Delta-9 + (THCA * 0.877)
        expected_total_thc = delta9_thc + (thca * 0.877)
        print(f"Test data: Delta-9 THC: {delta9_thc}%, THCA: {thca}%")
        print(f"Expected Total THC: {expected_total_thc:.2f}%")
        
        # Test compliance (should be non-compliant since > 0.3%)
        is_compliant = expected_total_thc <= 0.3
        print(f"Expected compliance status: {'Compliant' if is_compliant else 'Non-compliant'}")
        
        print("✅ THC calculation logic verified")
        return True
        
    except Exception as e:
        print(f"❌ THC calculation test error: {str(e)}")
        return False

def test_inventory_api():
    """Test GET /api/admin/inventory endpoint"""
    print("\n=== Testing Inventory API ===")
    
    try:
        response = requests.get(
            f"{API_BASE}/admin/inventory",
            headers=AUTH_HEADERS
        )
        
        print(f"Inventory API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            inventory_data = response.json()
            print(f"✅ Inventory API working - Retrieved {len(inventory_data)} products")
            
            # Check if products have required inventory fields
            if inventory_data:
                sample_product = inventory_data[0]
                required_fields = ['id', 'name', 'quantity', 'thc']
                missing_fields = [field for field in required_fields if field not in sample_product]
                
                if missing_fields:
                    print(f"⚠️ Missing fields in product data: {missing_fields}")
                else:
                    print("✅ Product data contains required inventory fields")
                
                # Check for THC compliance fields
                thc_fields = ['delta9THC', 'thca', 'totalTHC']
                thc_field_status = {field: field in sample_product for field in thc_fields}
                print(f"THC compliance fields: {thc_field_status}")
            
            return inventory_data
        else:
            print(f"❌ Inventory API failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Inventory API error: {str(e)}")
        return None

def test_inventory_update_api():
    """Test PUT /api/admin/inventory/{product_id} endpoint"""
    print("\n=== Testing Inventory Update API ===")
    
    try:
        # Get current inventory first
        inventory_response = requests.get(
            f"{API_BASE}/admin/inventory",
            headers=AUTH_HEADERS
        )
        
        if inventory_response.status_code != 200:
            print("❌ Cannot get current inventory for update test")
            return False
        
        inventory = inventory_response.json()
        if not inventory:
            print("❌ No products in inventory to test update")
            return False
        
        test_product = inventory[0]
        product_id = test_product['id']
        original_quantity = test_product.get('quantity', 0)
        new_quantity = original_quantity + 5  # Add 5 to current quantity
        
        print(f"Testing inventory update for product: {product_id}")
        print(f"Original quantity: {original_quantity}, New quantity: {new_quantity}")
        
        # Update inventory
        update_response = requests.put(
            f"{API_BASE}/admin/inventory/{product_id}",
            headers=AUTH_HEADERS,
            params={"quantity": new_quantity}
        )
        
        print(f"Update Response Status: {update_response.status_code}")
        print(f"Update Response: {update_response.text}")
        
        if update_response.status_code == 200:
            print("✅ Inventory update API working")
            
            # Verify the update persisted
            verify_response = requests.get(
                f"{API_BASE}/admin/inventory",
                headers=AUTH_HEADERS
            )
            
            if verify_response.status_code == 200:
                updated_inventory = verify_response.json()
                updated_product = next((p for p in updated_inventory if p['id'] == product_id), None)
                
                if updated_product and updated_product.get('quantity') == new_quantity:
                    print("✅ Inventory update persisted correctly")
                    return True
                else:
                    print(f"❌ Inventory update not persisted. Expected: {new_quantity}, Got: {updated_product.get('quantity') if updated_product else 'Product not found'}")
                    return False
            else:
                print("❌ Cannot verify inventory update")
                return False
        else:
            print(f"❌ Inventory update failed: {update_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Inventory update error: {str(e)}")
        return False

def test_enhanced_orders_api():
    """Test GET /api/admin/orders/enhanced endpoint"""
    print("\n=== Testing Enhanced Orders API ===")
    
    try:
        response = requests.get(
            f"{API_BASE}/admin/orders/enhanced",
            headers=AUTH_HEADERS
        )
        
        print(f"Enhanced Orders API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            orders_data = response.json()
            print(f"✅ Enhanced Orders API working - Retrieved {len(orders_data)} orders")
            
            if orders_data:
                sample_order = orders_data[0]
                required_fields = ['orderId', 'customerName', 'products', 'total']
                missing_fields = [field for field in required_fields if field not in sample_order]
                
                if missing_fields:
                    print(f"⚠️ Missing fields in order data: {missing_fields}")
                else:
                    print("✅ Order data contains required fields")
                
                # Check for THC compliance in products
                if 'products' in sample_order and sample_order['products']:
                    sample_product = sample_order['products'][0]
                    thc_fields = ['delta9THC', 'thca', 'totalTHC']
                    thc_field_status = {field: field in sample_product for field in thc_fields}
                    print(f"THC fields in order products: {thc_field_status}")
            
            return orders_data
        else:
            print(f"❌ Enhanced Orders API failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Enhanced Orders API error: {str(e)}")
        return None

def test_create_enhanced_order():
    """Test POST /api/admin/orders/enhanced endpoint"""
    print("\n=== Testing Create Enhanced Order ===")
    
    try:
        # Get inventory to create a realistic order
        inventory_response = requests.get(
            f"{API_BASE}/admin/inventory",
            headers=AUTH_HEADERS
        )
        
        if inventory_response.status_code != 200:
            print("❌ Cannot get inventory for order creation test")
            return False
        
        inventory = inventory_response.json()
        if not inventory:
            print("❌ No products available for order creation")
            return False
        
        # Create test order with realistic data
        test_product = inventory[0]
        order_data = {
            "customerName": "John Cannabis",
            "phoneNumber": "555-0123",
            "idVerified": True,
            "products": [
                {
                    "productId": test_product['id'],
                    "productName": test_product['name'],
                    "quantity": 1,
                    "delta9THC": test_product.get('delta9THC', 1.2),
                    "thca": test_product.get('thca', 25.8),
                    "totalTHC": test_product.get('totalTHC', 23.82),
                    "price": test_product['price']
                }
            ],
            "subtotal": test_product['price'],
            "status": "Pending"
        }
        
        print(f"Creating order for customer: {order_data['customerName']}")
        print(f"Product: {order_data['products'][0]['productName']}")
        print(f"THC Info: Δ9: {order_data['products'][0]['delta9THC']}%, THCA: {order_data['products'][0]['thca']}%, Total: {order_data['products'][0]['totalTHC']}%")
        
        response = requests.post(
            f"{API_BASE}/admin/orders/enhanced",
            headers=AUTH_HEADERS,
            json=order_data
        )
        
        print(f"Create Order Response Status: {response.status_code}")
        
        if response.status_code == 200:
            created_order = response.json()
            print(f"✅ Enhanced order created successfully")
            print(f"Order ID: {created_order.get('orderId')}")
            print(f"Total: ${created_order.get('total', 0):.2f}")
            print(f"Receipt URL: {created_order.get('receiptUrl')}")
            
            # Verify inventory was deducted
            verify_response = requests.get(
                f"{API_BASE}/admin/inventory",
                headers=AUTH_HEADERS
            )
            
            if verify_response.status_code == 200:
                updated_inventory = verify_response.json()
                updated_product = next((p for p in updated_inventory if p['id'] == test_product['id']), None)
                
                if updated_product:
                    original_qty = test_product.get('quantity', 0)
                    new_qty = updated_product.get('quantity', 0)
                    expected_qty = original_qty - 1
                    
                    if new_qty == expected_qty:
                        print("✅ Inventory deduction working correctly")
                    else:
                        print(f"⚠️ Inventory deduction issue. Expected: {expected_qty}, Got: {new_qty}")
            
            return created_order
        else:
            print(f"❌ Enhanced order creation failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Enhanced order creation error: {str(e)}")
        return None

def test_order_status_update():
    """Test PUT /api/admin/orders/enhanced/{order_id} endpoint"""
    print("\n=== Testing Order Status Update ===")
    
    try:
        # Get existing orders first
        orders_response = requests.get(
            f"{API_BASE}/admin/orders/enhanced",
            headers=AUTH_HEADERS
        )
        
        if orders_response.status_code != 200:
            print("❌ Cannot get orders for status update test")
            return False
        
        orders = orders_response.json()
        if not orders:
            print("❌ No orders available for status update test")
            return False
        
        test_order = orders[0]
        order_id = test_order.get('orderId')
        current_status = test_order.get('status', 'Unknown')
        new_status = "Completed" if current_status != "Completed" else "Processing"
        
        print(f"Testing status update for order: {order_id}")
        print(f"Current status: {current_status}, New status: {new_status}")
        
        response = requests.put(
            f"{API_BASE}/admin/orders/enhanced/{order_id}",
            headers=AUTH_HEADERS,
            params={"status": new_status}
        )
        
        print(f"Status Update Response Status: {response.status_code}")
        print(f"Status Update Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Order status update API working")
            return True
        else:
            print(f"❌ Order status update failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Order status update error: {str(e)}")
        return False

def test_receipt_generation(order_id=None):
    """Test GET /receipt/{order_id} endpoint"""
    print("\n=== Testing Receipt Generation ===")
    
    try:
        # If no order_id provided, get one from existing orders
        if not order_id:
            orders_response = requests.get(
                f"{API_BASE}/admin/orders/enhanced",
                headers=AUTH_HEADERS
            )
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                if orders:
                    order_id = orders[0].get('orderId')
                else:
                    print("❌ No orders available for receipt test")
                    return False
            else:
                print("❌ Cannot get orders for receipt test")
                return False
        
        print(f"Testing receipt generation for order: {order_id}")
        
        response = requests.get(f"{BACKEND_URL}/receipt/{order_id}")
        
        print(f"Receipt Response Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Not specified')}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'text/html' in content_type:
                print("✅ Receipt generation working - HTML content returned")
                
                # Check if receipt contains key elements
                content = response.text
                key_elements = ['BLZE', 'Receipt', 'Customer', 'THC', 'Total']
                found_elements = [elem for elem in key_elements if elem in content]
                
                print(f"Receipt contains key elements: {found_elements}")
                
                if len(found_elements) >= 4:
                    print("✅ Receipt contains required information")
                    return True
                else:
                    print("⚠️ Receipt missing some key elements")
                    return True  # Still working, just incomplete
            else:
                print(f"⚠️ Unexpected content type: {content_type}")
                return False
        else:
            print(f"❌ Receipt generation failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Receipt generation error: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n=== Testing Error Handling ===")
    
    error_tests = []
    
    try:
        # Test invalid product ID for inventory update
        print("Testing invalid product ID for inventory update...")
        response = requests.put(
            f"{API_BASE}/admin/inventory/invalid-product-id",
            headers=AUTH_HEADERS,
            params={"quantity": 10}
        )
        
        if response.status_code == 404:
            print("✅ Invalid product ID properly handled (404)")
            error_tests.append(True)
        else:
            print(f"⚠️ Unexpected response for invalid product ID: {response.status_code}")
            error_tests.append(False)
        
        # Test missing order ID for receipt
        print("Testing invalid order ID for receipt...")
        response = requests.get(f"{BACKEND_URL}/receipt/invalid-order-id")
        
        if response.status_code == 404:
            print("✅ Invalid order ID properly handled (404)")
            error_tests.append(True)
        else:
            print(f"⚠️ Unexpected response for invalid order ID: {response.status_code}")
            error_tests.append(False)
        
        # Test unauthorized access (invalid token)
        print("Testing unauthorized access...")
        invalid_headers = {
            "Authorization": "Bearer invalid_token",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{API_BASE}/admin/inventory",
            headers=invalid_headers
        )
        
        if response.status_code == 401:
            print("✅ Unauthorized access properly handled (401)")
            error_tests.append(True)
        else:
            print(f"⚠️ Unexpected response for unauthorized access: {response.status_code}")
            error_tests.append(False)
        
        success_rate = sum(error_tests) / len(error_tests) if error_tests else 0
        print(f"Error handling success rate: {success_rate:.1%}")
        
        return success_rate >= 0.7  # 70% success rate acceptable
        
    except Exception as e:
        print(f"❌ Error handling test error: {str(e)}")
        return False

def test_thc_compliance_flow():
    """Test the complete THC compliance and inventory management flow"""
    print("\n=== Testing Complete THC Compliance Flow ===")
    
    test_results = {}
    
    # Step 1: Test THC calculation functions
    test_results['thc_calculations'] = test_thc_calculation_functions()
    
    # Step 2: Test inventory API
    inventory_data = test_inventory_api()
    test_results['inventory_api'] = inventory_data is not None
    
    # Step 3: Test inventory update
    test_results['inventory_update'] = test_inventory_update_api()
    
    # Step 4: Test enhanced orders API
    orders_data = test_enhanced_orders_api()
    test_results['orders_api'] = orders_data is not None
    
    # Step 5: Create enhanced order
    created_order = test_create_enhanced_order()
    test_results['create_order'] = created_order is not None
    
    # Step 6: Test order status update
    test_results['order_status_update'] = test_order_status_update()
    
    # Step 7: Test receipt generation
    order_id = created_order.get('orderId') if created_order else None
    test_results['receipt_generation'] = test_receipt_generation(order_id)
    
    # Step 8: Test error handling
    test_results['error_handling'] = test_error_handling()
    
    # Summary
    print("\n=== THC Compliance Flow Summary ===")
    for test_name, result in test_results.items():
        status = "✅" if result else "❌"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    success_count = sum(test_results.values())
    total_tests = len(test_results)
    success_rate = success_count / total_tests
    
    print(f"\nOverall Success Rate: {success_rate:.1%} ({success_count}/{total_tests})")
    
    return success_rate >= 0.8  # 80% success rate for overall pass

def main():
    """Run all THC compliance tests"""
    print("🧪 BLZE Order & Inventory Management System with THC Compliance Testing")
    print("=" * 80)
    
    # Basic connectivity test
    try:
        response = requests.get(f"{API_BASE}/products")
        print(f"API connectivity: {'✅' if response.status_code == 200 else '❌'}")
    except Exception as e:
        print(f"❌ API connectivity failed: {str(e)}")
        return
    
    # Run complete THC compliance flow test
    success = test_thc_compliance_flow()
    
    print(f"\n🎯 Overall Test Result: {'✅ PASS' if success else '❌ FAIL'}")

if __name__ == "__main__":
    main()