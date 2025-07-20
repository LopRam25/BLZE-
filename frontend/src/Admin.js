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
    delta9THC: product?.delta9THC || "",
    thca: product?.thca || "",
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

  const handlePricingChange = (weight, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [weight]: parseFloat(value) || 0
      }
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

            <div className="grid grid-cols-4 gap-4">
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
                  THC % (Legacy)
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
                  Delta-9 THC %
                </label>
                <input
                  type="number"
                  name="delta9THC"
                  value={formData.delta9THC || ''}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.29"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  THCA %
                </label>
                <input
                  type="number"
                  name="thca"
                  value={formData.thca || ''}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="0.50"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pricing Structure
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.pricing).map(([weight, price]) => (
                  <div key={weight} className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-600 w-12">{weight}:</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => handlePricingChange(weight, e.target.value)}
                      step="0.01"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                ))}
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

const BlogForm = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    publishDate: post?.publishDate || new Date().toISOString().split('T')[0],
    image: post?.image || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentFile, setContentFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      // Handle HTML file upload
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, content: event.target.result }));
      };
      reader.readAsText(file);
    } else {
      alert('Please upload an HTML file (.html or .htm)');
    }
  };

  const generateBlogTemplate = () => {
    const template = `<!DOCTYPE html>
<html>
<head>
    <title>Blog Post - BLZE</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="bg-gray-50">
    <article class="max-w-4xl mx-auto py-12 px-4">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Your Blog Post Title</h1>
            <div class="text-gray-600">
                <time datetime="2025-01-01">January 1, 2025</time>
            </div>
        </header>
        
        <div class="prose prose-lg max-w-none">
            <p class="text-xl text-gray-700 mb-6">
                This is your blog post introduction. Make it engaging and informative.
            </p>
            
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Section Heading</h2>
            <p class="text-gray-600 mb-4">
                Add your content here. You can use HTML tags for formatting.
                Include images, links, and other elements as needed.
            </p>
            
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Subsection</h3>
            <ul class="list-disc pl-6 mb-4">
                <li>Use lists for key points</li>
                <li>Keep content organized and readable</li>
                <li>Use proper HTML structure</li>
            </ul>
            
            <p class="text-gray-600">
                Continue adding your content sections as needed.
            </p>
        </div>
    </article>
</body>
</html>`;

    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-post-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({ ...formData, id: post?.id });
    } catch (error) {
      console.error("Error saving blog post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {post ? "Edit Blog Post" : "New Blog Post"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Publish Date
              </label>
              <input
                type="date"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Featured Image URL (optional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content (HTML)
              </label>
              <div className="mb-3 flex space-x-2">
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={generateBlogTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Download Template
                </button>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="10"
                placeholder="Upload an HTML file or write your content here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                required
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : (post ? "Update Post" : "Create Post")}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
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
  const [enhancedOrders, setEnhancedOrders] = useState([]);
  const [pages, setPages] = useState({});
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showReceiptForm, setShowReceiptForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    
    try {
      const [productsRes, enhancedOrdersRes, pagesRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/admin/orders/enhanced`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API}/pages`)
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (enhancedOrdersRes.ok) setEnhancedOrders(await enhancedOrdersRes.json());
      if (pagesRes.ok) setPages(await pagesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSaveProduct = async (productData) => {
    const token = localStorage.getItem("admin_token");
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        productData[key].forEach(file => formData.append('images', file));
      } else if (key === 'coa' && productData[key]) {
        formData.append('coa', productData[key]);
      } else if (key === 'pricing') {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    });

    try {
      const url = editingProduct 
        ? `${API}/admin/products/${editingProduct.id}`
        : `${API}/admin/products`;
      
      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchData();
        setShowProductForm(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const toggleProductVisibility = async (productId, isVisible) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible })
      });

      if (response.ok) {
        setProducts(prev => prev.map(item => 
          item.id === productId ? { ...item, isVisible } : item
        ));
      }
    } catch (error) {
      console.error("Error updating product visibility:", error);
    }
  };

  const updateInventoryQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/inventory/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setProducts(prev => prev.map(item => 
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/orders/enhanced/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setEnhancedOrders(prev => prev.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const viewReceipt = (orderId) => {
    window.open(`${API.replace('/api', '')}/receipt/${orderId}`, '_blank');
  };

  const generateCustomReceipt = (receiptData) => {
    const testOrder = {
      orderId: 'CUSTOM' + Date.now().toString().slice(-6),
      dateTime: new Date().toISOString(),
      ...receiptData
    };
    
    const testReceiptUrl = `${API.replace('/api', '')}/receipt/${testOrder.orderId}`;
    window.open(testReceiptUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">BLZE Admin</h1>
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                window.location.reload();
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="flex min-w-max px-2">
          {[
            { id: "products", label: "Products", icon: "📦" },
            { id: "receipts", label: "Receipt Maker", icon: "🧾" },
            { id: "orders", label: "Orders", icon: "📋" },
            { id: "pages", label: "Pages", icon: "📄" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${"" +
                activeTab === tab.id
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 pb-20">
        {/* Products Manager */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Products Manager</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex space-x-3">
                    {product.images && product.images[0] && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-900">Stock: {product.quantity}</span>
                        <span className={"text-xs px-2 py-1 rounded-full " + (
                          product.isVisible !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        )}>
                          {product.isVisible !== false ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleProductVisibility(product.id, !product.isVisible)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium"
                    >
                      {product.isVisible !== false ? 'Hide' : 'Show'}
                    </button>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateInventoryQuantity(product.id, Math.max(0, product.quantity - 1))}
                        className="bg-red-100 text-red-700 w-8 h-8 rounded-lg text-sm font-medium"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{product.quantity}</span>
                      <button
                        onClick={() => updateInventoryQuantity(product.id, product.quantity + 1)}
                        className="bg-green-100 text-green-700 w-8 h-8 rounded-lg text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="text-lg font-medium text-gray-600 mb-1">No products yet</h3>
                <p className="text-sm text-gray-500">Add your first product above</p>
              </div>
            )}
          </div>
        )}

        {/* Receipt Maker */}
        {activeTab === "receipts" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Receipt Maker</h2>
              <button
                onClick={() => setShowReceiptForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + New Receipt
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const testReceipt = {
                      customerName: 'John Cannabis',
                      phoneNumber: '555-0123',
                      idVerified: true,
                      products: [
                        {
                          productName: 'Dante\'s Inferno',
                          quantity: 1,
                          delta9THC: 0.29,
                          thca: 25.8,
                          totalTHC: 22.91,
                          price: 85.00
                        }
                      ],
                      subtotal: 85.00,
                      exciseTax: 2.55,
                      salesTax: 6.80,
                      total: 94.35
                    };
                    generateCustomReceipt(testReceipt);
                  }}
                  className="w-full bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-sm font-medium text-left"
                >
                  📄 Generate Sample Receipt
                </button>
                <button
                  onClick={() => setShowReceiptForm(true)}
                  className="w-full bg-purple-100 text-purple-700 py-3 px-4 rounded-lg text-sm font-medium text-left"
                >
                  ✏️ Create Custom Receipt
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-medium text-gray-900 mb-3">Receipt Templates</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-gray-100 text-gray-700 py-8 rounded-lg text-xs">
                  🌿 Flower<br/>Receipt
                </button>
                <button className="bg-gray-100 text-gray-700 py-8 rounded-lg text-xs">
                  🍯 Concentrate<br/>Receipt
                </button>
                <button className="bg-gray-100 text-gray-700 py-8 rounded-lg text-xs">
                  🍪 Edible<br/>Receipt
                </button>
                <button className="bg-gray-100 text-gray-700 py-8 rounded-lg text-xs">
                  🎁 Bundle<br/>Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Orders</h2>
              <div className="text-sm text-gray-600">
                {enhancedOrders.length} total
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-yellow-100 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-800">
                  {enhancedOrders.filter(o => o.status === 'Pending').length}
                </div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-800">
                  {enhancedOrders.filter(o => o.status === 'Fulfilled').length}
                </div>
                <div className="text-xs text-green-600">Fulfilled</div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-red-800">
                  {enhancedOrders.filter(o => o.status === 'Cancelled').length}
                </div>
                <div className="text-xs text-red-600">Cancelled</div>
              </div>
            </div>

            <div className="space-y-3">
              {enhancedOrders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">#{order.orderId}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${order.total.toFixed(2)}</div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                        className={"text-xs px-2 py-1 rounded-full border-0 " + (
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Phone: </span>
                      <a href={`tel:${order.phoneNumber}`} className="text-blue-600">
                        {order.phoneNumber}
                      </a>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">ID Verified: </span>
                      <span className={order.idVerified ? 'text-green-600' : 'text-red-600'}>
                        {order.idVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Products: </span>
                      <span className="text-gray-900">
                        {order.products.map(p => p.productName).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => viewReceipt(order.orderId)}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium"
                    >
                      View Receipt
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {enhancedOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-lg font-medium text-gray-600 mb-1">No orders yet</h3>
                <p className="text-sm text-gray-500">Orders will appear here once placed</p>
              </div>
            )}
          </div>
        )}

        {/* Pages */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Pages Manager</h2>
            
            <div className="space-y-3">
              {Object.entries(pages).map(([pageType, pageData]) => (
                <div key={pageType} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{pageType} Page</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {pageData?.content ? `${pageData.content.substring(0, 100)}...` : 'No content yet'}
                      </p>
                    </div>
                    <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">📋 How to Update Pages</h3>
              <div className="space-y-1 text-sm text-green-800">
                <p>• Upload HTML files for perfect formatting</p>
                <p>• Content updates automatically on site</p>
                <p>• Mobile-friendly templates provided</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Product Form */}
      {showProductForm && (
        <MobileProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Mobile-Optimized Receipt Form */}
      {showReceiptForm && (
        <MobileReceiptForm
          onSave={generateCustomReceipt}
          onCancel={() => setShowReceiptForm(false)}
        />
      )}
    </div>
  );
};


    <div class="max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">About BLZE</h1>
        
        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
            <p class="text-gray-600 mb-4">
                Welcome to BLZE, your premier destination for high-quality cannabis products. 
                We are committed to providing exceptional products and service to our community.
            </p>
            <p class="text-gray-600">
                Edit this content to tell your unique story and mission.
            </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p class="text-gray-600">
                Add your mission statement and values here.
            </p>
        </div>
    </div>
</body>
</html>`,
      contact: `<!DOCTYPE html>
<html>
<head>
    <title>Contact Us - BLZE</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold text-gray-700">Phone</h3>
                        <p class="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-700">Email</h3>
                        <p class="text-gray-600">info@blze.com</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-700">Address</h3>
                        <p class="text-gray-600">123 Main Street<br>City, State 12345</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Hours</h2>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Monday - Friday</span>
                        <span class="text-gray-800">9:00 AM - 8:00 PM</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Saturday</span>
                        <span class="text-gray-800">10:00 AM - 6:00 PM</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Sunday</span>
                        <span class="text-gray-800">12:00 PM - 5:00 PM</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
    };

    const template = templates[pageType];
    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageType}-template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Blog management functions
  const handleDeleteBlogPost = async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/blog/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  };

  const updateInventoryQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/inventory/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setInventory(prev => prev.map(item => 
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/orders/enhanced/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setEnhancedOrders(prev => prev.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const viewReceipt = (orderId) => {
    window.open(`${API.replace('/api', '')}/receipt/${orderId}`, '_blank');
  };

  const generateTestReceipt = () => {
    // Create a test receipt for demonstration
    const testOrder = {
      orderId: 'TEST' + Date.now().toString().slice(-6),
      dateTime: new Date().toISOString(),
      customerName: 'John Cannabis',
      phoneNumber: '555-0123',
      idVerified: true,
      products: [
        {
          productName: 'Dante\'s Inferno',
          quantity: 1,
          delta9THC: 0.29,
          thca: 25.8,
          totalTHC: 22.91,
          price: 85.00
        }
      ],
      subtotal: 85.00,
      exciseTax: 2.55,
      salesTax: 6.80,
      total: 94.35,
      status: 'Pending'
    };
    
    // Generate receipt URL and open
    const testReceiptUrl = `${API.replace('/api', '')}/receipt/${testOrder.orderId}`;
    window.open(testReceiptUrl, '_blank');
  };

  const toggleProductVisibility = async (productId, isVisible) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/products/${productId}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible })
      });

      if (response.ok) {
        setInventory(prev => prev.map(item => 
          item.id === productId ? { ...item, isVisible } : item
        ));
      }
    } catch (error) {
      console.error("Error updating product visibility:", error);
    }
  };

  const updateProductQuality = async (productId, quality) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quality })
      });

      if (response.ok) {
        setInventory(prev => prev.map(item => 
          item.id === productId ? { ...item, quality } : item
        ));
      }
    } catch (error) {
      console.error("Error updating product quality:", error);
    }
  };

  const handleSaveBlogPost = async (blogPost) => {
    const token = localStorage.getItem("admin_token");
    
    try {
      const url = editingBlogPost 
        ? `${API}/admin/blog/${editingBlogPost.id}`
        : `${API}/admin/blog`;
      
      const method = editingBlogPost ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(blogPost)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (editingBlogPost) {
          setBlogPosts(blogPosts.map(p => p.id === result.id ? result : p));
        } else {
          setBlogPosts([...blogPosts, result]);
        }
        setShowBlogForm(false);
        setEditingBlogPost(null);
      } else {
        const errorText = await response.text();
        console.error("Error saving blog post:", errorText);
        alert("Error saving blog post: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving blog post: " + error.message);
    }
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
                Orders & Receipts
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "inventory"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab("pages")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "pages"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pages
              </button>
              <button
                onClick={() => setActiveTab("blog")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "blog"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Blog
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
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Orders & Receipts Management</h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={generateTestReceipt}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span>Generate Test Receipt</span>
                    </button>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>Total Orders: {enhancedOrders.length}</span>
                      <span>Pending: {enhancedOrders.filter(o => o.status === 'Pending').length}</span>
                      <span>Fulfilled: {enhancedOrders.filter(o => o.status === 'Fulfilled').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Products</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID Verified</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {enhancedOrders.map((order) => (
                          <tr key={order.orderId} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">#{order.orderId}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.dateTime).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{order.customerName}</div>
                            </td>
                            <td className="px-4 py-3">
                              <a href={`tel:${order.phoneNumber}`} className="text-blue-600 hover:text-blue-800">
                                {order.phoneNumber}
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                {order.products.slice(0, 2).map((product, index) => (
                                  <div key={index} className="mb-1">
                                    <span className="font-medium">{product.productName}</span>
                                    <span className="text-gray-500"> (x{product.quantity})</span>
                                  </div>
                                ))}
                                {order.products.length > 2 && (
                                  <div className="text-xs text-gray-400">
                                    +{order.products.length - 2} more...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">${order.total.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                Tax: ${(order.exciseTax + order.salesTax).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                order.idVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {order.idVerified ? '✅ Verified' : '❌ Not Verified'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                                className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Fulfilled">Fulfilled</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => viewReceipt(order.orderId)}
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                >
                                  Receipt
                                </button>
                                <button
                                  className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                                  title="View Full Details"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {enhancedOrders.length === 0 && (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-500">
                      Orders will appear here once customers start placing them
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "inventory" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showHiddenProducts}
                        onChange={(e) => setShowHiddenProducts(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-600">Show Hidden Products</span>
                    </label>
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
                        <div className="text-sm text-gray-600">Total Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {inventory.filter(p => p.quantity < 5).length}
                        </div>
                        <div className="text-sm text-gray-600">Low Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {inventory.reduce((sum, p) => sum + p.quantity, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Units</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inventory
                    .filter(product => showHiddenProducts || product.isVisible !== false)
                    .map((product) => (
                    <div key={product.id} className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
                      product.quantity < 5 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="relative">
                        {product.images && product.images[0] && (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        {product.quantity < 5 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            LOW STOCK
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex space-x-1">
                          <button
                            onClick={() => toggleProductVisibility(product.id, !product.isVisible)}
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              product.isVisible !== false ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                            }`}
                          >
                            {product.isVisible !== false ? '👁️ Visible' : '🚫 Hidden'}
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {product.category}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-purple-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs font-bold">
                          {product.quality || 'Premium'}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.type}</p>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Delta-9 THC:</span>
                              <div className="font-semibold">{product.delta9THC ? `${product.delta9THC}%` : 'N/A'}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">THCA:</span>
                              <div className="font-semibold">{product.thca ? `${product.thca}%` : 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-gray-600 text-sm">Total THC:</span>
                            <div className="font-bold text-blue-800">
                              {product.totalTHC ? `${product.totalTHC.toFixed(2)}%` : 'N/A'}
                            </div>
                          </div>
                          
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="text-gray-600 text-sm">Quality:</span>
                            <select
                              value={product.quality || 'Premium'}
                              onChange={(e) => updateProductQuality(product.id, e.target.value)}
                              className="w-full mt-1 px-2 py-1 border border-purple-300 rounded text-sm font-medium"
                            >
                              <option value="Premium">Premium</option>
                              <option value="Top Shelf">Top Shelf</option>
                              <option value="Mid Grade">Mid Grade</option>
                              <option value="Budget">Budget</option>
                            </select>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-600 font-medium">Current Stock:</span>
                              <span className={`font-bold text-lg ${
                                product.quantity < 5 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {product.quantity} units
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateInventoryQuantity(product.id, Math.max(0, product.quantity - 1))}
                                className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors font-medium"
                              >
                                -1
                              </button>
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => updateInventoryQuantity(product.id, parseInt(e.target.value) || 0)}
                                className="w-16 text-center border border-gray-300 rounded-lg py-2 px-2 font-semibold"
                              />
                              <button
                                onClick={() => updateInventoryQuantity(product.id, product.quantity + 1)}
                                className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors font-medium"
                              >
                                +1
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Edit Product
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {inventory.length === 0 && (
                  <div className="text-center py-16">
                    <div className="mb-4">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No inventory data available
                    </h3>
                    <p className="text-gray-500">
                      Add products with inventory information to see them here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pages" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Pages Management</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* About Us Page */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About Us Page</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload HTML File
                          </label>
                          <input
                            type="file"
                            accept=".html,.htm"
                            onChange={(e) => handlePageFileUpload(e, 'about')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Content Preview
                          </label>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 max-h-32 overflow-y-auto">
                            {pages.about?.content ? pages.about.content.substring(0, 200) + '...' : 'No content uploaded yet'}
                          </div>
                        </div>
                        <button
                          onClick={() => generateHTMLTemplate('about')}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Download Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact Page */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Page</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload HTML File
                          </label>
                          <input
                            type="file"
                            accept=".html,.htm"
                            onChange={(e) => handlePageFileUpload(e, 'contact')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Content Preview
                          </label>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 max-h-32 overflow-y-auto">
                            {pages.contact?.content ? pages.contact.content.substring(0, 200) + '...' : 'No content uploaded yet'}
                          </div>
                        </div>
                        <button
                          onClick={() => generateHTMLTemplate('contact')}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Download Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Help/Instructions */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-green-900 mb-4">📋 Instructions</h3>
                      <div className="space-y-3 text-sm text-green-800">
                        <p><strong>1.</strong> Click "Download Template" to get a sample HTML file</p>
                        <p><strong>2.</strong> Edit the template with your content</p>
                        <p><strong>3.</strong> Upload your HTML file using the file input</p>
                        <p><strong>4.</strong> Content will automatically update on your site</p>
                        <div className="mt-4 p-3 bg-white rounded-lg">
                          <p className="font-semibold text-green-900">Supported:</p>
                          <ul className="text-xs text-green-700 mt-1">
                            <li>• HTML tags (h1, p, div, etc.)</li>
                            <li>• CSS classes (use Tailwind)</li>
                            <li>• Images (use URLs)</li>
                            <li>• Links</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "blog" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
                  <button
                    onClick={() => setShowBlogForm(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>New Blog Post</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingBlogPost(post);
                                setShowBlogForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteBlogPost(post.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">{post.publishDate && new Date(post.publishDate).toLocaleDateString()}</p>
                          <div className="text-gray-700 text-sm">
                            {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {blogPosts.length === 0 && (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No blog posts yet
                    </h3>
                    <p className="text-gray-500">
                      Create your first blog post using the button above
                    </p>
                  </div>
                )}
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

      {/* Blog Form Modal */}
      {showBlogForm && (
        <BlogForm
          post={editingBlogPost}
          onSave={handleSaveBlogPost}
          onCancel={() => {
            setShowBlogForm(false);
            setEditingBlogPost(null);
          }}
        />
      )}
    </div>
  );
};

const MobileProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: product?.id || "",
    name: product?.name || "",
    type: product?.type || "",
    category: product?.category || "hybrid",
    thc: product?.thc || 0,
    delta9THC: product?.delta9THC || "",
    thca: product?.thca || "",
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    description: product?.description || "",
    genetics: product?.genetics || "",
    aroma: product?.aroma || "",
    flavor: product?.flavor || "",
    isPremium: product?.isPremium || false,
    isVisible: product?.isVisible !== false,
    quality: product?.quality || "Premium"
  });

  const [images, setImages] = useState([]);
  const [coa, setCoa] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, images, coa });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] rounded-t-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onCancel} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="hybrid">Hybrid</option>
                <option value="sativa">Sativa</option>
                <option value="indica">Indica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="Premium">Premium</option>
                <option value="Top Shelf">Top Shelf</option>
                <option value="Mid Grade">Mid Grade</option>
                <option value="Budget">Budget</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delta-9 THC %</label>
              <input
                type="number"
                step="0.01"
                value={formData.delta9THC}
                onChange={(e) => setFormData(prev => ({ ...prev, delta9THC: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="0.29"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">THCA %</label>
              <input
                type="number"
                step="0.01"
                value={formData.thca}
                onChange={(e) => setFormData(prev => ({ ...prev, thca: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="25.8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Premium Product</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Visible to Customers</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-6 pb-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              {product ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MobileReceiptForm = ({ onSave, onCancel }) => {
  const [receiptData, setReceiptData] = useState({
    customerName: '',
    phoneNumber: '',
    idVerified: true,
    products: [
      {
        productName: '',
        quantity: 1,
        delta9THC: 0.29,
        thca: 25.8,
        totalTHC: 22.91,
        price: 0
      }
    ],
    subtotal: 0,
    exciseTax: 0,
    salesTax: 0,
    total: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subtotal = receiptData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const exciseTax = subtotal * 0.03;
    const salesTax = subtotal * 0.08;
    const total = subtotal + exciseTax + salesTax;
    
    onSave({
      ...receiptData,
      subtotal,
      exciseTax,
      salesTax,
      total
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] rounded-t-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Create Custom Receipt</h2>
          <button onClick={onCancel} className="text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={receiptData.customerName}
              onChange={(e) => setReceiptData(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={receiptData.phoneNumber}
              onChange={(e) => setReceiptData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={receiptData.idVerified}
              onChange={(e) => setReceiptData(prev => ({ ...prev, idVerified: e.target.checked }))}
              className="rounded"
            />
            <label className="text-sm text-gray-700">ID Verified</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Information</label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={receiptData.products[0].productName}
                onChange={(e) => {
                  const newProducts = [...receiptData.products];
                  newProducts[0].productName = e.target.value;
                  setReceiptData(prev => ({ ...prev, products: newProducts }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={receiptData.products[0].quantity}
                  onChange={(e) => {
                    const newProducts = [...receiptData.products];
                    newProducts[0].quantity = parseInt(e.target.value);
                    setReceiptData(prev => ({ ...prev, products: newProducts }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={receiptData.products[0].price}
                  onChange={(e) => {
                    const newProducts = [...receiptData.products];
                    newProducts[0].price = parseFloat(e.target.value);
                    setReceiptData(prev => ({ ...prev, products: newProducts }));
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-6 pb-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              Generate Receipt
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
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