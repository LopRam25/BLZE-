import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";
import Admin from "./Admin";
import Navigation from "./components/Navigation";
import AboutPage from "./components/AboutPage";
import BlogPage, { BlogPost } from "./components/BlogPage";
import ContactPage from "./components/ContactPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AgeVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const [birthDate, setBirthDate] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerification = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    setTimeout(() => {
      setIsVerifying(false);
      if (age >= 21) {
        localStorage.setItem('ageVerified', 'true');
        onVerified();
        onClose();
      } else {
        alert("You must be 21 or older to access this site.");
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🔞</div>
          <h2 className="text-2xl font-bold mb-2">Age Verification Required</h2>
          <p className="text-gray-600">You must be 21 or older to access this cannabis delivery service.</p>
        </div>
        
        <form onSubmit={handleVerification}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isVerifying || !birthDate}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isVerifying || !birthDate
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Age'}
          </button>
        </form>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>By proceeding, you confirm you are 21+ and agree to our terms of service.</p>
        </div>
      </div>
    </div>
  );
};

const CartModal = ({ isOpen, onClose, cart, updateCart, removeFromCart, deliveryLocation }) => {
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleProceedToPayment = () => {
    if (!customerPhone || !customerName || !customerEmail) {
      alert("Please fill in all customer information");
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async (method) => {
    setIsProcessingOrder(true);

    // Create order object
    const orderData = {
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail
      },
      items: cart,
      address: deliveryLocation,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      paymentMethod: method,
      orderTime: new Date().toLocaleString()
    };

    try {
      // Send order to backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert("Order placed successfully! You'll receive a confirmation shortly.");
        onClose();
        setShowPayment(false);
        // Clear cart after successful order
        cart.forEach(item => removeFromCart(item.id));
      } else {
        alert("Error placing order. Please try again.");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert("Error placing order. Please try again.");
    }

    setIsProcessingOrder(false);
  };

  const handleStripePayment = async () => {
    // In a real app, you'd integrate with Stripe Elements
    // For now, we'll simulate a successful payment
    setTimeout(() => {
      handlePayment("Credit Card");
    }, 2000);
  };

  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Payment</h2>
            <button onClick={() => setShowPayment(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold">Order Total: ${total.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Delivering to: {deliveryLocation}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleStripePayment}
              disabled={isProcessingOrder}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                isProcessingOrder
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessingOrder ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span>Pay with Card</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => handlePayment("Cash")}
              disabled={isProcessingOrder}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                isProcessingOrder
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              <span>Pay with Cash</span>
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>🔒 Your payment information is secure and encrypted</p>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-black">
                <span className="font-semibold">Delivering to:</span> {deliveryLocation}
              </p>
              <p className="text-sm text-gray-600">Est. delivery: 30-45 min</p>
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
                      <p className="text-sm font-semibold text-black">${item.price}</p>
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
              
              {/* Customer Information */}
              <div className="mb-4 space-y-3">
                <h3 className="font-semibold text-gray-700">Customer Information</h3>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Your Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
              
              <button 
                onClick={handleProceedToPayment}
                disabled={!customerPhone || !customerName || !customerEmail}
                className={`w-full py-3 rounded-lg font-semibold mt-4 transition-colors ${
                  !customerPhone || !customerName || !customerEmail
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                Proceed to Payment • ${total.toFixed(2)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const handleCallNow = () => {
    window.location.href = "tel:8285823092";
  };

  const openImageModal = (index = 0) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextModalImage = () => {
    if (product.images && product.images.length > 1) {
      setModalImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevModalImage = () => {
    if (product.images && product.images.length > 1) {
      setModalImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && product.images && product.images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && product.images && product.images.length > 1) {
      prevImage();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] hover:scale-105 transition-all duration-300 transform hover:-translate-y-3 border border-gray-200 relative backdrop-blur-sm">
      {/* Enhanced holographic effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 via-purple-100/10 to-pink-100/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
      
      <div 
        className="h-60 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden rounded-t-2xl swipable-image"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={product.images ? product.images[currentImageIndex] : product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Image navigation */}
        {product.images && product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            {/* Image indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Premium badge with glow effect */}
        {product.isPremium && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            <span className="font-bold">✨ PREMIUM</span>
          </div>
        )}
        
        {/* THCA badge with glow effect */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
          <span className="font-bold">{product.thc}% THC{product.thc >= 35 ? 'A' : ''}</span>
        </div>
        
        {/* Stock badge */}
        {product.quantity && (
          <div className="absolute top-10 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            <span className="font-bold">{product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.type}</p>
          
          {/* Basic info centered */}
          <div className="flex items-center justify-center mb-2">
            <span className="text-yellow-500 text-sm mr-1">★</span>
            <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
          </div>
          
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        </div>
        
        {/* Expandable details */}
        {isExpanded && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3 text-sm">
              {product.genetics && (
                <div className="text-center">
                  <span className="font-semibold text-gray-700">Genetics: </span>
                  <span className="text-gray-600">{product.genetics}</span>
                </div>
              )}
              {product.grower && (
                <div className="text-center">
                  <span className="font-semibold text-gray-700">Grower: </span>
                  <span className="text-gray-600">{product.grower}</span>
                </div>
              )}
              {product.aroma && (
                <div className="text-center">
                  <span className="font-semibold text-gray-700">Aroma: </span>
                  <span className="text-gray-600">{product.aroma}</span>
                </div>
              )}
              {product.flavor && (
                <div className="text-center">
                  <span className="font-semibold text-gray-700">Flavor: </span>
                  <span className="text-gray-600">{product.flavor}</span>
                </div>
              )}
              <div className="text-center">
                <span className="font-semibold text-gray-700">THC Content: </span>
                <span className="text-gray-600">{product.thc}%{product.thc >= 35 ? ' THCA' : ''}</span>
              </div>
              <div className="text-center">
                <span className="font-semibold text-gray-700">Type: </span>
                <span className="text-gray-600">{product.type}</span>
              </div>
              {product.coa && (
                <div className="text-center">
                  <span className="text-green-600 font-semibold flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    COA Available
                  </span>
                </div>
              )}
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-black">
                  <strong>Effects:</strong> {product.description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2 text-center text-sm">Pricing</h4>
          <div className="flex flex-wrap justify-center gap-1 text-xs">
            {product.pricing ? (
              Object.entries(product.pricing).map(([weight, price]) => (
                <span key={weight} className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                  <span className="font-medium">{weight}</span>
                  <span className="font-bold text-black">:${price}</span>
                </span>
              ))
            ) : (
              <span className="bg-gray-50 px-2 py-1 rounded">
                <span className="font-medium">Price</span>
                <span className="font-bold text-black">:${product.price}</span>
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <button 
            onClick={handleCallNow}
            className="bg-green-600 text-white px-6 py-2.5 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span>Call Now</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-black text-sm font-semibold hover:text-gray-700 transition-colors py-2"
          >
            {isExpanded ? 'Show Less Details ▲' : 'Show More Details ▼'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'thc-high':
        return b.thc - a.thc;
      case 'thc-low':
        return a.thc - b.thc;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (!isAgeVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <AgeVerificationModal 
          isOpen={!isAgeVerified}
          onClose={() => setIsAgeVerified(true)}
          onVerified={() => setIsAgeVerified(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search for premium cannabis flower..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🌿</span>
              <span>All</span>
            </button>
            <button
              onClick={() => setSelectedCategory('sativa')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === 'sativa'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>☀️</span>
              <span>Sativa</span>
            </button>
            <button
              onClick={() => setSelectedCategory('indica')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === 'indica'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🌙</span>
              <span>Indica</span>
            </button>
            <button
              onClick={() => setSelectedCategory('hybrid')}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === 'hybrid'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>⚡</span>
              <span>Hybrid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Premium Cannabis Flower
              </h1>
              <p className="text-gray-600">
                {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">BLZE Cannabis</h3>
              <p className="text-gray-400 text-sm">
                Premium cannabis delivery service serving North Carolina with the highest quality THCA flower.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Menu</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Service Area</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Buncombe County</li>
                <li>Henderson County</li>
                <li>Polk County</li>
                <li>Transylvania County</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Call to order:</p>
                <p className="text-white font-semibold">(828) 582-3092</p>
                <p className="text-white font-semibold">(828) 844-1805</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 BLZE Cannabis. All rights reserved. Must be 21+ to order.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;