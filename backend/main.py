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
SETTINGS_FILE = "settings.json"

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
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic models
class Product(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    category: str
    thc: float
    price: float
    quantity: int
    description: str
    genetics: Optional[str] = None
    grower: Optional[str] = None
    aroma: Optional[str] = None
    flavor: Optional[str] = None
    isPremium: bool = False
    images: List[str] = []
    coa: Optional[str] = None
    rating: float = 0.0
    reviews: int = 0

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
    except:
        return []

def save_products(products):
    with open(PRODUCTS_FILE, 'w') as f:
        json.dump(products, f, indent=2)

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
    products[index] = product_dict
    save_products(products)
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
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{unique_filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    return {"url": f"/uploads/{unique_filename}"}

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

# Dashboard stats
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)