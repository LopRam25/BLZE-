import React, { useState, useEffect } from "react";
import "./App.css";

const LocationModal = ({ isOpen, onClose, onLocationSet }) => {
  const [address, setAddress] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      onLocationSet(address);
      onClose();
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd use a geocoding service to convert coords to address
          const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setAddress(mockAddress);
          setIsGettingLocation(false);
          // Auto-submit with location
          onLocationSet(mockAddress);
          onClose();
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          alert("Unable to get your location. Please enter address manually.");
        }
      );
    } else {
      setIsGettingLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    // Mock address suggestions - in real app, use Google Places API
    if (value.length > 2) {
      const mockSuggestions = [
        `${value} Street, Los Angeles, CA`,
        `${value} Ave, Beverly Hills, CA`,
        `${value} Blvd, Santa Monica, CA`,
        `${value} Dr, West Hollywood, CA`
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setAddress(suggestion);
    setSuggestions([]);
    onLocationSet(suggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Enter Your Location</h2>
        
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center space-x-2"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Use Current Location</span>
            </>
          )}
        </button>

        <div className="text-center text-gray-500 mb-4">or</div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your delivery address"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          
          {suggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirm Location
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CartModal = ({ isOpen, onClose, cart, updateCart, removeFromCart, deliveryLocation }) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Order</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {deliveryLocation && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Delivering to:</span> {deliveryLocation}
              </p>
              <p className="text-sm text-green-600">Est. delivery: 30-45 min</p>
            </div>
          )}
          
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.type} • {item.thc}% THC</p>
                      <p className="text-sm font-semibold text-green-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateCart(item.id, item.quantity - 1)} 
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateCart(item.id, item.quantity + 1)} 
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors mt-4">
                Place Order • ${total.toFixed(2)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gray-200 relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
          {product.thc}% THC{product.thc >= 35 ? 'A' : ''}
        </div>
        {product.isPremium && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            🔥 PREMIUM
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.type}</p>
        {product.genetics && (
          <p className="text-xs text-gray-500 mb-1">Genetics: {product.genetics}</p>
        )}
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">${product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All", icon: "🌿" },
    { id: "sativa", name: "Sativa", icon: "☀️" },
    { id: "indica", name: "Indica", icon: "🌙" },
    { id: "hybrid", name: "Hybrid", icon: "⚡" },
    { id: "concentrates", name: "Concentrates", icon: "💎" },
    { id: "edibles", name: "Edibles", icon: "🍪" }
  ];

  const products = [
    {
      id: 1,
      name: "Dante's Inferno",
      type: "Indica-Dominant Hybrid",
      category: "hybrid",
      thc: 35.97,
      price: 85,
      description: "Premium THCA flower with sweet creamy notes. Calming, mellow, slightly euphoric - perfect for winding down",
      image: "https://i.ibb.co/mCmXk6d9/image1.jpg",
      rating: 4.9,
      reviews: 42,
      isPremium: true,
      genetics: "Devil Driver x Oreoz",
      grower: "Discount Pharms",
      aroma: "Sweet with creamy notes",
      flavor: "Smooth, dessert-like, rich",
      images: [
        "https://i.ibb.co/mCmXk6d9/image1.jpg",
        "https://i.ibb.co/DHpSz8sS/image2.jpg", 
        "https://i.ibb.co/C3mJX0Zz/image3.jpg"
      ]
    },
    {
      id: 2,
      name: "Jack Frost",
      type: "Sativa",
      category: "sativa",
      thc: 25.3,
      price: 45,
      description: "Premium sativa strain with energizing effects perfect for daytime use",
      image: "https://images.pexels.com/photos/7667843/pexels-photo-7667843.jpeg",
      rating: 4.8,
      reviews: 124,
      isPremium: false
    },
    {
      id: 3,
      name: "Blue Dream",
      type: "Hybrid",
      category: "hybrid",
      thc: 22.8,
      price: 42,
      description: "Balanced hybrid perfect for any time of day with sweet berry aroma",
      image: "https://images.unsplash.com/photo-1519181236443-b175d4c3ca1d",
      rating: 4.9,
      reviews: 89,
      isPremium: false
    },
    {
      id: 4,
      name: "Purple Haze",
      type: "Indica",
      category: "indica",
      thc: 20.5,
      price: 38,
      description: "Relaxing indica perfect for evening use and stress relief",
      image: "https://images.unsplash.com/photo-1712051339878-4945960151e3",
      rating: 4.7,
      reviews: 156,
      isPremium: false
    },
    {
      id: 5,
      name: "OG Kush",
      type: "Hybrid",
      category: "hybrid",
      thc: 24.1,
      price: 48,
      description: "Classic hybrid with earthy pine scent and balanced effects",
      image: "https://images.pexels.com/photos/7667843/pexels-photo-7667843.jpeg",
      rating: 4.8,
      reviews: 203,
      isPremium: false
    },
    {
      id: 6,
      name: "Granddaddy Purple",
      type: "Indica",
      category: "indica",
      thc: 19.8,
      price: 40,
      description: "Deep relaxation with grape and berry flavors",
      image: "https://images.unsplash.com/photo-1519181236443-b175d4c3ca1d",
      rating: 4.6,
      reviews: 78,
      isPremium: false
    },
    {
      id: 7,
      name: "Green Crack",
      type: "Sativa",
      category: "sativa",
      thc: 26.2,
      price: 46,
      description: "Energizing sativa with tropical fruit flavors",
      image: "https://images.unsplash.com/photo-1712051339878-4945960151e3",
      rating: 4.9,
      reviews: 167,
      isPremium: false
    }
  ];

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCart = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!deliveryLocation) {
      setIsLocationModalOpen(true);
    }
  }, [deliveryLocation]);

  return (
    <div className="App bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-green-600">BLZE</div>
              <div className="text-sm text-gray-500">Cannabis Delivery</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center space-x-2 text-sm bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="max-w-32 truncate">
                  {deliveryLocation || "Set location"}
                </span>
              </button>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 3H3m4 10v4a2 2 0 002 2h8a2 2 0 002-2v-4M9 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for strains..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      {deliveryLocation && (
        <div className="bg-green-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span className="text-sm text-green-800">
                  <span className="font-semibold">Delivery to:</span> {deliveryLocation}
                </span>
              </div>
              <span className="text-sm text-green-600 font-semibold">30-45 min</span>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {selectedCategory === "all" ? "All Products" : categories.find(c => c.id === selectedCategory)?.name}
          </h1>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} products
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Fixed Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 right-4 z-30">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 3H3m4 10v4a2 2 0 002 2h8a2 2 0 002-2v-4M9 17a2 2 0 11-4 0 2 2 0 014 0zM20 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>View Cart ({cartItemCount})</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSet={setDeliveryLocation}
      />
      
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateCart={updateCart}
        removeFromCart={removeFromCart}
        deliveryLocation={deliveryLocation}
      />
    </div>
  );
}

export default App;