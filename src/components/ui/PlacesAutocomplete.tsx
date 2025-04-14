import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Label } from './label';

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

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onAddressSelect,
  error,
  defaultValue = ""
}) => {
  const [street, setStreet] = useState(defaultValue || "");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  // Initialize form with default value if provided
  useEffect(() => {
    if (defaultValue) {
      // Submit initial value to parent form
      submitAddress();
    }
  }, [defaultValue]);
  
  // Auto-save address when street field is filled and user moves to next field
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setStreet(newValue);
  };

  const handleStreetBlur = () => {
    if (street) {
      submitAddress();
    }
  };
  
  // Handle field changes for other fields with auto-save
  const handleFieldChange = (field: string, value: string) => {
    switch(field) {
      case 'suburb':
        setSuburb(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'province':
        setProvince(value);
        // Immediately update for province changes to fix the issue with "next" not working
        setTimeout(() => {
          onAddressSelect({
            street,
            suburb,
            city,
            province: value, // Use the new value directly
            postalCode,
            fullAddress: `${street}, ${suburb}, ${city}, ${value}, ${postalCode}`.replace(/, ,/g, ",").replace(/^,|,$/g, "")
          });
        }, 0);
        return; // Skip the general submitAddress call for province
      case 'postalCode':
        setPostalCode(value);
        break;
    }
    
    // Auto-save when any field changes if street is already filled
    setTimeout(() => {
      if (street) {
        submitAddress();
      }
    }, 100);
  };
  
  const submitAddress = () => {
    if (!street) {
      return;
    }
    
    const addressData = {
      street,
      suburb,
      city,
      province,
      postalCode,
      fullAddress: `${street}, ${suburb}, ${city}, ${province}, ${postalCode}`.replace(/, ,/g, ",").replace(/^,|,$/g, "")
    };
    
    onAddressSelect(addressData);
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
          onChange={handleStreetChange}
          onBlur={handleStreetBlur}
          placeholder="123 Main Street"
          className={`mt-1 ${error ? 'border-destructive' : ''}`}
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="manual-suburb">Suburb</Label>
          <Input 
            id="manual-suburb"
            value={suburb}
            onChange={(e) => handleFieldChange('suburb', e.target.value)}
            placeholder="Suburb"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="manual-city">City</Label>
          <Input 
            id="manual-city"
            value={city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="City"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="manual-province">Province</Label>
          <select
            id="manual-province"
            value={province}
            onChange={(e) => handleFieldChange('province', e.target.value)}
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
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            placeholder="0000"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default PlacesAutocomplete; 