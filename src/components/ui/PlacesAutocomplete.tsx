import React, { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PlacesAutocompleteProps {
  onAddressSelect: (address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    fullAddress: string;
  }) => void;
  error?: string;
  defaultValue?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

// Manual address input component as fallback
const ManualAddressInput: React.FC<{ onSubmit: (address: any) => void, defaultValue?: string }> = ({ onSubmit, defaultValue }) => {
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  const handleSubmit = () => {
    if (!street) {
      toast.error("Street address is required");
      return;
    }
    
    onSubmit({
      street,
      suburb,
      city,
      province,
      postalCode,
      fullAddress: `${street}, ${suburb}, ${city}, ${province}, ${postalCode}`.replace(/, ,/g, ",").replace(/^,|,$/g, "")
    });
    
    toast.success("Address saved");
  };
  
  // South African provinces
  const provinces = [
    "Eastern Cape", 
    "Free State", 
    "Gauteng", 
    "KwaZulu-Natal", 
    "Limpopo", 
    "Mpumalanga", 
    "Northern Cape", 
    "North West", 
    "Western Cape"
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input 
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="123 Main Street"
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manual-suburb">Suburb</Label>
          <Input 
            id="manual-suburb"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="Suburb"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="manual-city">City</Label>
          <Input 
            id="manual-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="manual-province">Province</Label>
          <select
            id="manual-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="form-input w-full mt-1"
          >
            <option value="">Select a province</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="manual-postalCode">Postal Code</Label>
          <Input 
            id="manual-postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="0000"
            className="mt-1"
          />
        </div>
      </div>
      
      <button 
        type="button" 
        onClick={handleSubmit}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
      >
        <MapPin size={16} />
        Save Address
      </button>
    </div>
  );
};

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onAddressSelect,
  error,
  defaultValue = ""
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(true); // Default to manual entry for now
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const placesElementRef = useRef<any>(null);

  // Handle when the API fails - show manual input instead
  const handleApiFailure = (errorMessage: string) => {
    setApiError(errorMessage);
    setIsLoading(false);
    setShowManualInput(true);
  };

  useEffect(() => {
    // Initialize Google Places Autocomplete Element
    const initPlacesAutocomplete = () => {
      if (!autocompleteRef.current) return;

      setIsLoading(true);
      setApiError(null);

      try {
        // Hardcoded API key - this key might not have billing enabled
        const GOOGLE_MAPS_API_KEY = 'AIzaSyBRxYkNEPd5J8iqJfPsv-UGJry1_2ldLis';
        
        if (!GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key is not configured');
        }

        // Catch billing errors by listening for global errors
        const errorHandler = (event: ErrorEvent) => {
          if (event.message && 
              (event.message.includes('BillingNotEnabledMapError') || 
               event.message.includes('Google Maps JavaScript API error'))) {
            handleApiFailure("Google Maps API billing is not enabled. Please use manual address entry.");
            // Remove the error listener
            window.removeEventListener('error', errorHandler);
          }
        };
        
        window.addEventListener('error', errorHandler);

        // Create the new PlaceAutocompleteElement
        if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
          console.error("PlaceAutocompleteElement not available");
          handleApiFailure("Google Maps API not available. Please use manual address entry.");
          return;
        }

        // Clear previous instance if any
        if (autocompleteRef.current.firstChild) {
          autocompleteRef.current.innerHTML = '';
        }

        // Create new PlaceAutocompleteElement
        placesElementRef.current = new window.google.maps.places.PlaceAutocompleteElement({
          inputType: 'text',
          componentRestrictions: { country: "za" },
          types: ["address"],
          fields: ["address_components", "formatted_address", "geometry", "name"],
        });

        // Add the element to the DOM
        autocompleteRef.current.appendChild(placesElementRef.current);

        // Style the element to match our design
        const inputElement = placesElementRef.current.querySelector('input');
        if (inputElement) {
          inputElement.className = `form-input w-full ${error || apiError ? 'border-destructive' : ''}`;
          inputElement.placeholder = "Start typing your address...";
          
          // Set initial value if provided
          if (defaultValue) {
            inputElement.value = defaultValue;
          }
        }

        // Listen for place selection
        placesElementRef.current.addEventListener('gmp-placeselect', (event: any) => {
          try {
            const place = event.detail.place;
            
            if (!place.addressComponents) {
              toast.error("Please select an address from the dropdown");
              return;
            }

            const addressData = {
              street: "",
              suburb: "",
              city: "",
              province: "",
              postalCode: "",
              fullAddress: place.formattedAddress || place.name
            };

            // Map address components to our format
            place.addressComponents.forEach((component: any) => {
              const types = component.types;
              
              if (types.includes("street_number") || types.includes("route")) {
                addressData.street += (addressData.street ? " " : "") + component.longText;
              }
              if (types.includes("sublocality") || types.includes("suburb")) {
                addressData.suburb = component.longText;
              }
              if (types.includes("locality")) {
                addressData.city = component.longText;
              }
              if (types.includes("administrative_area_level_1")) {
                addressData.province = component.longText;
              }
              if (types.includes("postal_code")) {
                addressData.postalCode = component.longText;
              }
            });

            // Fill in missing fields with defaults if necessary
            if (!addressData.suburb) addressData.suburb = addressData.city || "";
            if (!addressData.city && addressData.suburb) addressData.city = addressData.suburb;
            if (!addressData.province) addressData.province = "N/A";
            if (!addressData.postalCode) addressData.postalCode = "0000";

            // Validate street at minimum
            if (!addressData.street) {
              toast.error("Selected address is missing street information");
              return;
            }

            setInputValue(addressData.fullAddress);
            onAddressSelect(addressData);
            window.removeEventListener('error', errorHandler);
            
            // Show success message
            toast.success("Address selected");
          } catch (e) {
            console.error("Error processing place:", e);
            toast.error("Error processing address. Please try another address.");
          }
        });

        setShowManualInput(false); // Show automated search if API loaded successfully
        
      } catch (error) {
        console.error("Error initializing PlacesAutocompleteElement:", error);
        handleApiFailure("Failed to load address search. Please use manual entry.");
      } finally {
        setIsLoading(false);
      }
    };

    // Load Google Maps JavaScript API
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.PlaceAutocompleteElement) {
        // API already loaded
        initPlacesAutocomplete();
        return;
      }

      const GOOGLE_MAPS_API_KEY = 'AIzaSyBRxYkNEPd5J8iqJfPsv-UGJry1_2ldLis';
      
      setIsLoading(true);

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        handleApiFailure("Failed to load Google Maps. Using manual address entry.");
      };

      script.onload = () => {
        // Give a small delay to let the API initialize
        setTimeout(initPlacesAutocomplete, 100);
      };

      document.head.appendChild(script);
    };

    try {
      loadGoogleMapsAPI();
    } catch (e) {
      handleApiFailure("Error loading Google Maps. Using manual address entry.");
    }

    return () => {
      // Clean up
    };
  }, [onAddressSelect, defaultValue, error, apiError]);

  // Toggle between automatic and manual
  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
  };

  if (showManualInput) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="label">Manual Address Entry</Label>
          <button 
            type="button" 
            onClick={toggleManualInput}
            className="text-sm text-primary hover:underline"
          >
            Try automatic search
          </button>
        </div>
        <ManualAddressInput onSubmit={onAddressSelect} defaultValue={defaultValue} />
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex justify-between items-center">
        <Label htmlFor="gmp-address-search" className="label">Search Address</Label>
        <button 
          type="button" 
          onClick={toggleManualInput}
          className="text-sm text-primary hover:underline"
        >
          Enter address manually
        </button>
      </div>
      <div className="relative">
        {/* PlaceAutocompleteElement will be inserted here */}
        <div 
          ref={autocompleteRef} 
          className="gmp-address-search w-full"
          data-placeholder="Start typing your address..."
        ></div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>
      {(error || apiError) && (
        <p className="text-sm text-destructive mt-1">{error || apiError}</p>
      )}
    </div>
  );
};

export default PlacesAutocomplete; 