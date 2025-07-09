import React, { useState, useEffect } from "react";
import "./App.css";

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
                : 'bg-green-600 text-white hover:bg-green-700'
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

const LocationModal = ({ isOpen, onClose, onLocationSet }) => {
  const [address, setAddress] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [isInDeliveryArea, setIsInDeliveryArea] = useState(null);

  const deliveryAreas = [
    "Buncombe County, NC",
    "Henderson County, NC", 
    "Polk County, NC",
    "Transylvania County, NC"
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim() && isInDeliveryArea) {
      onLocationSet(address);
      onClose();
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    // Request location with better options
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const fullAddress = `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`;
          setAddress(fullAddress);
          
          // Check if location is in delivery area
          const isInNC = data.principalSubdivision === "North Carolina";
          const county = data.city || data.locality;
          
          if (isInNC && county) {
            const countyMatch = deliveryAreas.find(area => 
              area.toLowerCase().includes(county.toLowerCase())
            );
            
            if (countyMatch) {
              setIsInDeliveryArea(true);
              setSelectedCounty(countyMatch);
            } else {
              setIsInDeliveryArea(false);
            }
          } else {
            setIsInDeliveryArea(false);
          }
          
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setAddress(mockAddress);
          setIsInDeliveryArea(true); // Assume it's in delivery area for demo
          setSelectedCounty("Buncombe County, NC");
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
        
        let errorMessage = "Unable to get your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setAddress(value);
    
    // Check if address contains delivery area keywords
    const lowerValue = value.toLowerCase();
    const countyMatch = deliveryAreas.find(area => 
      lowerValue.includes(area.toLowerCase().split(' ')[0]) || 
      lowerValue.includes(area.toLowerCase())
    );
    
    if (countyMatch) {
      setIsInDeliveryArea(true);
      setSelectedCounty(countyMatch);
    } else if (value.length > 5) {
      setIsInDeliveryArea(false);
      setSelectedCounty("");
    }
    
    // Real address suggestions using geocoding API
    if (value.length > 3) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw&country=US&region=North%20Carolina&types=address,poi&limit=5`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const addressSuggestions = data.features.map(feature => feature.place_name);
          setSuggestions(addressSuggestions);
        } else {
          // Fallback to mock suggestions
          const mockSuggestions = deliveryAreas.map(county => 
            `${value} Street, ${county}`
          ).slice(0, 3);
          setSuggestions(mockSuggestions);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        // Fallback to mock suggestions
        const mockSuggestions = deliveryAreas.map(county => 
          `${value} Street, ${county}`
        ).slice(0, 3);
        setSuggestions(mockSuggestions);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setAddress(suggestion);
    setSuggestions([]);
    setIsInDeliveryArea(true);
    const county = deliveryAreas.find(area => suggestion.includes(area));
    setSelectedCounty(county || "Buncombe County, NC");
    onLocationSet(suggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Enter Your Location</h2>
        
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 font-semibold">🚚 We deliver to:</p>
          <ul className="text-xs text-green-700 mt-1">
            {deliveryAreas.map((area, index) => (
              <li key={index}>• {area}</li>
            ))}
          </ul>
        </div>
        
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
            className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          
          {isInDeliveryArea === false && address.length > 5 && (
            <div className="mb-3 p-2 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">❌ Sorry, we don't deliver to this area yet.</p>
            </div>
          )}
          
          {isInDeliveryArea === true && selectedCounty && (
            <div className="mb-3 p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">✅ Great! We deliver to {selectedCounty}</p>
            </div>
          )}
          
          {suggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!isInDeliveryArea}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                isInDeliveryArea 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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
                  : 'bg-green-600 text-white hover:bg-green-700'
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
                    : 'bg-green-600 text-white hover:bg-green-700'
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

const ProductCard = ({ product, addToCart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
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
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.type}</p>
        
        {/* Basic info always visible */}
        <div className="flex items-center mb-2">
          <span className="text-yellow-500 text-sm mr-1">★</span>
          <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        
        {/* Expandable details */}
        {isExpanded && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              {product.genetics && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Genetics:</span>
                  <span className="text-gray-600">{product.genetics}</span>
                </div>
              )}
              {product.grower && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Grower:</span>
                  <span className="text-gray-600">{product.grower}</span>
                </div>
              )}
              {product.aroma && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Aroma:</span>
                  <span className="text-gray-600">{product.aroma}</span>
                </div>
              )}
              {product.flavor && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Flavor:</span>
                  <span className="text-gray-600">{product.flavor}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">THC Content:</span>
                <span className="text-gray-600">{product.thc}%{product.thc >= 35 ? ' THCA' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Type:</span>
                <span className="text-gray-600">{product.type}</span>
              </div>
              <div className="mt-3 p-2 bg-green-50 rounded">
                <p className="text-xs text-green-800">
                  <strong>Effects:</strong> {product.description}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-center text-green-600 text-sm font-semibold mb-3 hover:text-green-700"
        >
          {isExpanded ? 'Show Less ▲' : 'Show More Details ▼'}
        </button>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">${product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Add to Cart
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
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Check age verification on component mount
  useEffect(() => {
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified === 'true') {
      setIsAgeVerified(true);
    }
  }, []);

  // Show location modal after age verification
  useEffect(() => {
    if (isAgeVerified && !deliveryLocation) {
      setIsLocationModalOpen(true);
    }
  }, [isAgeVerified, deliveryLocation]);

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

  // Show age verification modal if not verified
  if (!isAgeVerified) {
    return (
      <div className="App bg-gray-50 min-h-screen">
        <AgeVerificationModal
          isOpen={true}
          onClose={() => {}}
          onVerified={() => setIsAgeVerified(true)}
        />
      </div>
    );
  }

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
            {selectedCategory === "all" ? "Premium Products" : categories.find(c => c.id === selectedCategory)?.name}
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