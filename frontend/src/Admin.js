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
  const [blogPosts, setBlogPosts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    
    try {
      const [productsRes, enhancedOrdersRes, pagesRes, blogRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/admin/orders/enhanced`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API}/pages`),
        fetch(`${API}/blog`)
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (enhancedOrdersRes.ok) setEnhancedOrders(await enhancedOrdersRes.json());
      if (pagesRes.ok) setPages(await pagesRes.json());
      if (blogRes.ok) setBlogPosts(await blogRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSaveProduct = async (productData) => {
    // The ProductForm component handles its own API calls
    // This function just refreshes the data and closes the form
    await fetchData();
    setShowProductForm(false);
    setEditingProduct(null);
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
        await fetchData();
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

  const toggleProductVisibility = async (productId, isVisible) => {
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`${API}/admin/inventory/${productId}`, {
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
      } else {
        console.error("Failed to update visibility");
        alert("Failed to update product visibility");
      }
    } catch (error) {
      console.error("Error updating product visibility:", error);
      alert("Error updating product visibility");
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
      } else {
        console.error("Failed to update inventory");
        alert("Failed to update inventory");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Error updating inventory");
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
  const [products, setProducts] = useState([]);
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

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API}/products`);
        if (response.ok) {
          const productsData = await response.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    
    fetchProducts();
  }, []);

  const addProductLine = () => {
    setReceiptData(prev => ({
      ...prev,
      products: [...prev.products, {
        productName: '',
        quantity: 1,
        delta9THC: 0.29,
        thca: 25.8,
        totalTHC: 22.91,
        price: 0
      }]
    }));
  };

  const removeProductLine = (index) => {
    setReceiptData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProductLine = (index, field, value) => {
    setReceiptData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => {
        if (i === index) {
          if (field === 'productName') {
            // Auto-fill product details when product is selected
            const selectedProduct = products.find(p => p.name === value);
            if (selectedProduct) {
              return {
                ...product,
                productName: value,
                delta9THC: selectedProduct.delta9THC || 0.29,
                thca: selectedProduct.thca || 25.8,
                totalTHC: selectedProduct.totalTHC || 22.91,
                price: selectedProduct.pricing ? selectedProduct.pricing['3.5g'] || selectedProduct.price : selectedProduct.price
              };
            }
          }
          return { ...product, [field]: value };
        }
        return product;
      })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subtotal = receiptData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    onSave({
      ...receiptData,
      subtotal,
      exciseTax: 0, // Remove automatic tax calculation
      salesTax: 0,  // Remove automatic tax calculation  
      total: subtotal // Total is just the subtotal
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Products</label>
              <button
                type="button"
                onClick={addProductLine}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
              >
                + Add Product
              </button>
            </div>
            
            <div className="space-y-3">
              {receiptData.products.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-700">Product {index + 1}</h4>
                    {receiptData.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProductLine(index)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <select
                      value={product.productName}
                      onChange={(e) => updateProductLine(index, 'productName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select a Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>{p.name} - {p.category}</option>
                      ))}
                    </select>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={product.quantity}
                        onChange={(e) => updateProductLine(index, 'quantity', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={product.price}
                        onChange={(e) => updateProductLine(index, 'price', parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Delta-9 THC %"
                        value={product.delta9THC}
                        onChange={(e) => updateProductLine(index, 'delta9THC', parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="THCA %"
                        value={product.thca}
                        onChange={(e) => updateProductLine(index, 'thca', parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Total THC %"
                        value={product.totalTHC}
                        onChange={(e) => updateProductLine(index, 'totalTHC', parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
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