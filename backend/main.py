from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import json
from datetime import datetime
import shutil

app = FastAPI(title="BLZE Cannabis API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Admin credentials (in production, use proper authentication)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "blze2024"

# Data storage (in production, use proper database)
PRODUCTS_FILE = "products.json"
ORDERS_FILE = "orders.json"
INVENTORY_FILE = "inventory.json"
RECEIPTS_FILE = "receipts.json"
SETTINGS_FILE = "settings.json"
PAGES_FILE = "backend/pages.json"
BLOG_FILE = "backend/blog.json"

# Ensure data files exist
def ensure_data_files():
    if not os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, 'w') as f:
            json.dump([
                {
                    "id": "dante-inferno-001",
                    "name": "Dante's Inferno",
                    "type": "Indica-Dominant Hybrid",
                    "category": "hybrid",
                    "thc": 35.97,
                    "price": 85,
                    "quantity": 12,
                    "description": "Premium THCA flower with sweet creamy notes. Calming, mellow, slightly euphoric - perfect for winding down",
                    "genetics": "Devil Driver x Oreoz",
                    "grower": "Discount Pharms",
                    "aroma": "Sweet with creamy notes",
                    "flavor": "Smooth, dessert-like, rich",
                    "isPremium": True,
                    "rating": 4.9,
                    "reviews": 42,
                    "images": [
                        "https://i.ibb.co/mCmXk6d9/image1.jpg",
                        "https://i.ibb.co/DHpSz8sS/image2.jpg", 
                        "https://i.ibb.co/C3mJX0Zz/image3.jpg"
                    ],
                    "coa": ""
                }
            ], f)
    
    if not os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, 'w') as f:
            json.dump({
                "notification_numbers": ["8285823092", "8288441805"],
                "business_info": {
                    "name": "BLZE Cannabis",
                    "address": "Western NC",
                    "phone": "8285823092"
                }
            }, f)

ensure_data_files()

# Create uploads directory
uploads_dir = "/app/uploads"
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

class Product(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    category: str
    thc: float
    price: float
    pricing: Optional[dict] = None
    quantity: int
    description: str
    genetics: Optional[str] = None
    aroma: Optional[str] = None
    flavor: Optional[str] = None
    isPremium: bool = False
    images: List[str] = []
    coa: Optional[str] = None
    rating: float = 0.0
    reviews: int = 0
    # New inventory fields
    sku: Optional[str] = None
    unitWeightGrams: Optional[float] = None
    delta9THC: Optional[float] = None  # in %
    thca: Optional[float] = None      # in %
    totalTHC: Optional[float] = None  # calculated
    isCompliant: Optional[bool] = None
    warningFlag: Optional[bool] = None

class PageContent(BaseModel):
    title: str
    heroImage: Optional[str] = None
    missionStatement: Optional[str] = None
    content: str
    email: Optional[str] = None
    phone: Optional[str] = None
    alternatePhone: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[str] = None

class BlogPost(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    image: Optional[str] = None
    publishDate: Optional[str] = None
    published: bool = True

class OrderProduct(BaseModel):
    productId: str
    productName: str
    quantity: int
    delta9THC: float
    thca: float
    totalTHC: float
    price: float

class EnhancedOrder(BaseModel):
    orderId: Optional[str] = None
    dateTime: Optional[str] = None
    customerName: str
    phoneNumber: str
    idVerified: bool = True
    products: List[OrderProduct]
    subtotal: float
    exciseTax: float = 0.0
    salesTax: float = 0.0
    total: float
    status: str = "Pending"
    receiptUrl: Optional[str] = None

class Receipt(BaseModel):
    orderId: str
    receiptId: str
    generatedAt: str
    receiptData: dict

class Order(BaseModel):
    id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: str
    items: List[dict]
    address: str
    total: float
    status: str = "pending"
    created_at: Optional[str] = None

class Settings(BaseModel):
    notification_numbers: List[str]
    business_info: dict

# Helper functions
def load_products():
    try:
        with open(PRODUCTS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_products(products):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump(products, f, indent=2)

def load_pages():
    try:
        with open(PAGES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"about": {}, "contact": {}}

def save_pages(pages):
    with open(PAGES_FILE, 'w') as f:
        json.dump(pages, f, indent=2)

def load_blog_posts():
    try:
        with open(BLOG_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_blog_posts(posts):
    with open(BLOG_FILE, 'w') as f:
        json.dump(posts, f, indent=2)

def load_enhanced_orders():
    try:
        with open("enhanced_orders.json", 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_enhanced_orders(orders):
    with open("enhanced_orders.json", 'w') as f:
        json.dump(orders, f, indent=2)

def load_receipts():
    try:
        with open(RECEIPTS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_receipts(receipts):
    with open(RECEIPTS_FILE, 'w') as f:
        json.dump(receipts, f, indent=2)

# THC Compliance Functions
def calculate_total_thc(delta9_thc: float, thca: float) -> float:
    """Calculate Total THC based on delta9 and THCA"""
    return delta9_thc + (thca * 0.877)

def check_compliance(total_thc: float) -> bool:
    """Check product compliance (totalTHC <= 0.3%)"""
    return total_thc <= 0.3

def update_product_inventory(product: dict) -> dict:
    """Update product with inventory data (no compliance checking)"""
    if product.get('delta9THC') is not None and product.get('thca') is not None:
        product['totalTHC'] = calculate_total_thc(product['delta9THC'], product['thca'])
    return product

def deduct_inventory(order_products: list, products: list) -> list:
    """Deduct inventory quantities after order"""
    for order_product in order_products:
        product_id = order_product.get('productId')
        quantity = order_product.get('quantity', 0)
        
        for product in products:
            if product.get('id') == product_id:
                product['quantity'] = max(0, product.get('quantity', 0) - quantity)
                break
    return products

def generate_receipt_data(order: dict) -> dict:
    """Generate order receipt data"""
    return {
        "header": {
            "logo": "BLZE™",
            "website": "www.blze.co",
            "receiptId": order.get('orderId'),
            "date": order.get('dateTime'),
            "customer": order.get('customerName'),
            "phone": order.get('phoneNumber'),
            "idVerified": order.get('idVerified', True),
        },
        "products": order.get('products', []),
        "pricing": {
            "subtotal": order.get('subtotal', 0),
            "exciseTax": order.get('exciseTax', 0),
            "salesTax": order.get('salesTax', 0),
            "total": order.get('total', 0),
        },
        "compliance": {
            "disclaimer": [
                "⚠️ Must be 21+ to purchase.",
                "✅ ID verified at time of sale.",
                "🚫 Do not operate vehicles or machinery while impaired.",
                "🧊 Store safely. Keep out of reach of children and pets."
            ],
        },
        "url": order.get('receiptUrl', '')
    }

def load_orders():
    try:
        with open(ORDERS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_orders(orders):
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=2)

def load_settings():
    try:
        with open(SETTINGS_FILE, 'r') as f:
            return json.load(f)
    except:
        return {"notification_numbers": [], "business_info": {}}

def save_settings(settings):
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(settings, f, indent=2)

# Authentication
def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, implement proper JWT token verification
    if credentials.credentials != "admin_token":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return True

# Public endpoints
@app.get("/")
async def root():
    return {"message": "BLZE Cannabis API"}

@app.get("/api/products")
async def get_products():
    products = load_products()
    return products

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    products = load_products()
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Admin endpoints
@app.post("/api/admin/products")
async def create_product(product: Product, admin: bool = Depends(verify_admin)):
    products = load_products()
    product_dict = product.dict()
    product_dict["id"] = str(uuid.uuid4())
    products.append(product_dict)
    save_products(products)
    return product_dict

@app.put("/api/admin/products/{product_id}")
async def update_product(product_id: str, product: Product, admin: bool = Depends(verify_admin)):
    products = load_products()
    index = next((i for i, p in enumerate(products) if p["id"] == product_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = product.dict()
    product_dict["id"] = product_id
    
    # Debug logging
    print(f"Updating product {product_id}")
    print(f"Received product data: {product_dict}")
    print(f"Images in received data: {product_dict.get('images', [])}")
    
    products[index] = product_dict
    save_products(products)
    
    # Verify the save
    saved_products = load_products()
    saved_product = next((p for p in saved_products if p["id"] == product_id), None)
    print(f"After save - images in database: {saved_product.get('images', []) if saved_product else 'Product not found'}")
    
    return product_dict

@app.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str, admin: bool = Depends(verify_admin)):
    products = load_products()
    products = [p for p in products if p["id"] != product_id]
    save_products(products)
    return {"message": "Product deleted"}

@app.post("/api/admin/upload")
async def upload_file(file: UploadFile = File(...), admin: bool = Depends(verify_admin)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Use absolute path
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"File uploaded successfully: {file_path}")
        
        # Return URL
        return {"url": f"/api/uploads/{unique_filename}"}
    except Exception as e:
        print(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.get("/api/admin/orders")
async def get_orders(admin: bool = Depends(verify_admin)):
    return load_orders()

@app.put("/api/admin/orders/{order_id}")
async def update_order_status(order_id: str, status: str, admin: bool = Depends(verify_admin)):
    orders = load_orders()
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order["status"] = status
    save_orders(orders)
    return order

@app.get("/api/admin/settings")
async def get_settings(admin: bool = Depends(verify_admin)):
    return load_settings()

@app.put("/api/admin/settings")
async def update_settings(settings: Settings, admin: bool = Depends(verify_admin)):
    save_settings(settings.dict())
    return settings

@app.get("/api/admin/stats")
async def get_stats(admin: bool = Depends(verify_admin)):
    products = load_products()
    orders = load_orders()
    
    return {
        "total_products": len(products),
        "total_orders": len(orders),
        "pending_orders": len([o for o in orders if o["status"] == "pending"]),
        "total_revenue": sum(o["total"] for o in orders if o["status"] == "completed"),
        "low_stock_products": [p for p in products if p["quantity"] < 5]
    }

# CMS Endpoints
@app.get("/api/pages")
async def get_pages():
    return load_pages()

@app.get("/api/pages/{page_type}")
async def get_page(page_type: str):
    pages = load_pages()
    if page_type not in pages:
        raise HTTPException(status_code=404, detail="Page not found")
    return pages[page_type]

@app.put("/api/admin/pages/{page_type}")
async def update_page(page_type: str, page: PageContent, admin: bool = Depends(verify_admin)):
    pages = load_pages()
    from datetime import datetime
    
    page_data = page.dict()
    page_data["lastUpdated"] = datetime.now().isoformat()
    
    pages[page_type] = page_data
    save_pages(pages)
    return page_data

@app.get("/api/blog")
async def get_blog_posts():
    posts = load_blog_posts()
    # Return only published posts for public API
    return [post for post in posts if post.get("published", True)]

@app.get("/api/blog/{post_id}")
async def get_blog_post(post_id: str):
    posts = load_blog_posts()
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

@app.get("/api/admin/blog")
async def get_all_blog_posts(admin: bool = Depends(verify_admin)):
    return load_blog_posts()

@app.post("/api/admin/blog")
async def create_blog_post(post: BlogPost, admin: bool = Depends(verify_admin)):
    posts = load_blog_posts()
    
    # Generate ID if not provided
    if not post.id:
        post.id = f"post-{len(posts) + 1}"
    
    from datetime import datetime
    post_data = post.dict()
    if not post_data.get("publishDate"):
        post_data["publishDate"] = datetime.now().isoformat()
    
    posts.append(post_data)
    save_blog_posts(posts)
    return post_data

@app.put("/api/admin/blog/{post_id}")
async def update_blog_post(post_id: str, post: BlogPost, admin: bool = Depends(verify_admin)):
    posts = load_blog_posts()
    index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    post_data = post.dict()
    post_data["id"] = post_id
    
    posts[index] = post_data
    save_blog_posts(posts)
    return post_data

@app.delete("/api/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, admin: bool = Depends(verify_admin)):
    posts = load_blog_posts()
    index = next((i for i, p in enumerate(posts) if p["id"] == post_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    deleted_post = posts.pop(index)
    save_blog_posts(posts)
    return deleted_post

# Enhanced Order System Endpoints
@app.get("/api/admin/inventory")
async def get_inventory(admin: bool = Depends(verify_admin)):
    """Get all products with inventory data"""
    products = load_products()
    return products

@app.put("/api/admin/inventory/{product_id}")
async def update_inventory(product_id: str, quantity: int, admin: bool = Depends(verify_admin)):
    """Update product inventory quantity"""
    products = load_products()
    
    for product in products:
        if product.get('id') == product_id:
            product['quantity'] = quantity
            break
    else:
        raise HTTPException(status_code=404, detail="Product not found")
    
    save_products(products)
    return {"message": "Inventory updated successfully"}

@app.post("/api/admin/orders/enhanced")
async def create_enhanced_order(order: EnhancedOrder, admin: bool = Depends(verify_admin)):
    """Create a new enhanced order with THC compliance tracking"""
    from datetime import datetime
    import uuid
    
    # Generate order ID and timestamp
    order_data = order.dict()
    order_data['orderId'] = str(uuid.uuid4())[:8].upper()
    order_data['dateTime'] = datetime.now().isoformat()
    
    # Calculate taxes (simplified - 8% sales tax, 3% excise tax)
    subtotal = order_data['subtotal']
    order_data['exciseTax'] = round(subtotal * 0.03, 2)
    order_data['salesTax'] = round(subtotal * 0.08, 2)
    order_data['total'] = round(subtotal + order_data['exciseTax'] + order_data['salesTax'], 2)
    
    # Generate receipt
    receipt_data = generate_receipt_data(order_data)
    order_data['receiptUrl'] = f"/receipt/{order_data['orderId']}"
    
    # Save receipt
    receipts = load_receipts()
    receipt = {
        "orderId": order_data['orderId'],
        "receiptId": order_data['orderId'],
        "generatedAt": order_data['dateTime'],
        "receiptData": receipt_data
    }
    receipts.append(receipt)
    save_receipts(receipts)
    
    # Deduct inventory
    products = load_products()
    updated_products = deduct_inventory(order_data['products'], products)
    save_products(updated_products)
    
    # Save order
    orders = load_enhanced_orders()
    orders.append(order_data)
    save_enhanced_orders(orders)
    
    return order_data

@app.get("/api/admin/orders/enhanced")
async def get_enhanced_orders(admin: bool = Depends(verify_admin)):
    """Get all enhanced orders"""
    return load_enhanced_orders()

@app.put("/api/admin/orders/enhanced/{order_id}")
async def update_order_status(order_id: str, status: str, admin: bool = Depends(verify_admin)):
    """Update order status"""
    orders = load_enhanced_orders()
    
    for order in orders:
        if order.get('orderId') == order_id:
            order['status'] = status
            break
    else:
        raise HTTPException(status_code=404, detail="Order not found")
    
    save_enhanced_orders(orders)
    return {"message": "Order status updated successfully"}

@app.get("/receipt/{order_id}")
async def get_receipt(order_id: str):
    """Get receipt for an order"""
    receipts = load_receipts()
    
    for receipt in receipts:
        if receipt.get('orderId') == order_id:
            return receipt['receiptData']
    
    raise HTTPException(status_code=404, detail="Receipt not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)