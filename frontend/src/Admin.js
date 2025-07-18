import React, { useState, useEffect } from "react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "blze2024") {
      localStorage.setItem("admin_token", "admin_token");
      onLogin();
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-black mb-2">BLZE</div>
          <div className="text-gray-500">Admin Portal</div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
          >
            Access Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
};

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    type: product?.type || "",
    category: product?.category || "sativa",
    thc: product?.thc || 0,
    price: product?.price || 0,
    pricing: product?.pricing || {
      "1g": 10,
      "3.5g": 30,
      "7g": 60,
      "14g": 110,
      "28g": 200
    },
    quantity: product?.quantity || 0,
    description: product?.description || "",
    genetics: product?.genetics || "",
    grower: product?.grower || "",
    aroma: product?.aroma || "",
    flavor: product?.flavor || "",
    isPremium: product?.isPremium || false,
    images: product?.images || [],
    coa: product?.coa || ""
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingCOA, setUploadingCOA] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem("admin_token");
    
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch(`${API}/admin/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          // Use the backend URL to create full image path
          const imageUrl = `${BACKEND_URL}${result.url}`;
          uploadedUrls.push(imageUrl);
          console.log("Uploaded image URL:", imageUrl);
        } else {
          console.error("Upload failed:", await response.text());
        }
      }
      
      if (uploadedUrls.length > 0) {
        setFormData(prev => {
          const updatedFormData = {
            ...prev,
            images: [...prev.images, ...uploadedUrls]
          };
          console.log("Updated form data after upload:", updatedFormData);
          console.log("All images after upload:", updatedFormData.images);
          return updatedFormData;
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCOAUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCOA(true);
    const token = localStorage.getItem("admin_token");
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`${API}/admin/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          coa: `${BACKEND_URL}${result.url}`
        }));
      }
    } catch (error) {
      console.error("Error uploading COA:", error);
      alert("Error uploading COA");
    } finally {
      setUploadingCOA(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if still uploading
    if (uploading || uploadingCOA) {
      alert("Please wait for all uploads to complete before saving.");
      return;
    }
    
    // Create a fresh copy of form data to ensure latest state
    const currentFormData = { ...formData };
    
    console.log("Form data being submitted:", currentFormData);
    console.log("Images in form data:", currentFormData.images);
    
    const token = localStorage.getItem("admin_token");
    
    try {
      const url = product 
        ? `${API}/admin/products/${product.id}`
        : `${API}/admin/products`;
      
      const method = product ? "PUT" : "POST";
      
      console.log("Sending request to:", url);
      console.log("Method:", method);
      console.log("Data:", JSON.stringify(currentFormData, null, 2));
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(currentFormData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Product saved successfully:", result);
        onSave(result);
      } else {
        const errorText = await response.text();
        console.error("Error saving product:", errorText);
        alert("Error saving product: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving product: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {product ? "Edit Product" : "Add New Product"}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="sativa">Sativa</option>
                  <option value="indica">Indica</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="concentrates">Concentrates</option>
                  <option value="edibles">Edibles</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  THC %
                </label>
                <input
                  type="number"
                  name="thc"
                  value={formData.thc}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity in Stock
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genetics
                </label>
                <input
                  type="text"
                  name="genetics"
                  value={formData.genetics}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grower
                </label>
                <input
                  type="text"
                  name="grower"
                  value={formData.grower}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aroma
                </label>
                <input
                  type="text"
                  name="aroma"
                  value={formData.aroma}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flavor
                </label>
                <input
                  type="text"
                  name="flavor"
                  value={formData.flavor}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                COA (Certificate of Analysis) Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCOAUpload}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {uploadingCOA && <p className="text-sm text-gray-500 mt-1">Uploading COA...</p>}
              
              {formData.coa && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Current COA:</p>
                  <div className="relative inline-block">
                    <img
                      src={formData.coa}
                      alt="COA Certificate"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, coa: ""}))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Premium Product
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              
              {formData.images.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || uploadingCOA}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  uploading || uploadingCOA
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {uploading || uploadingCOA 
                  ? "Uploading..." 
                  : product ? "Update Product" : "Add Product"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    
    try {
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/admin/orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API}/admin/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const token = localStorage.getItem("admin_token");
    
    try {
      const response = await fetch(`${API}/admin/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSaveProduct = (product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, product]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-black">BLZE</div>
              <div className="text-gray-500">Admin Dashboard</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
                <p className="text-3xl font-bold text-black">{stats.total_products || 0}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total_orders || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v0a2 2 0 002 2h2m0-4h6m-6 4h6m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Pending Orders</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.pending_orders || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">${stats.total_revenue || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "products"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "orders"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>Add New Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="h-48 bg-gray-200 relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Image failed to load:", product.images[0]);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        )}
                        {product.isPremium && (
                          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            🔥 PREMIUM
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">{product.type}</p>
                          {product.pricing ? (
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              {Object.entries(product.pricing).map(([weight, price]) => (
                                <div key={weight} className="bg-gray-50 p-1 rounded flex justify-between">
                                  <span>{weight}:</span>
                                  <span className="font-bold text-black">${price}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-black">${product.price}</p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Stock: {product.quantity}</span>
                            <span className="text-gray-600">THC: {product.thc}%</span>
                          </div>
                          {product.coa && (
                            <p className="text-sm text-black flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              COA Available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Management</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customer_phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.created_at}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard />;
}

export default Admin;