import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, PersonalInfoFormData } from '@/utils/validation';
import { useFormContext } from '@/utils/formContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import PlacesAutocomplete from '@/components/ui/PlacesAutocomplete';
import { parseSouthAfricanID } from '@/utils/validation';

// Mock address suggestions for the address search
const addressSuggestions = [
  { 
    fullAddress: "123 Main Street, Sandton, Johannesburg, Gauteng, 2196", 
    street: "123 Main Street",
    suburb: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2196"
  },
  { 
    fullAddress: "45 Park Avenue, Rosebank, Johannesburg, Gauteng, 2196", 
    street: "45 Park Avenue",
    suburb: "Rosebank",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2196"
  },
  { 
    fullAddress: "78 Mandela Street, Durban Central, Durban, KwaZulu-Natal, 4001", 
    street: "78 Mandela Street",
    suburb: "Durban Central",
    city: "Durban",
    province: "KwaZulu-Natal",
    postalCode: "4001"
  },
  { 
    fullAddress: "234 Long Street, Cape Town City Centre, Cape Town, Western Cape, 8001", 
    street: "234 Long Street",
    suburb: "Cape Town City Centre",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001"
  },
  { 
    fullAddress: "56 Church Street, Pretoria Central, Pretoria, Gauteng, 0002", 
    street: "56 Church Street",
    suburb: "Pretoria Central",
    city: "Pretoria",
    province: "Gauteng",
    postalCode: "0002"
  },
];

const PersonalInfoForm: React.FC = () => {
  const { formData, updateFormData, nextStep, goToStep } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [idInfo, setIdInfo] = useState<ReturnType<typeof parseSouthAfricanID>>(null);
  const [showAllErrors, setShowAllErrors] = useState(false);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isValid, isSubmitted }, 
    setValue, 
    watch,
    setError,
    clearErrors,
    trigger
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      idNumber: formData.idNumber || "",
      phoneNumber: formData.phone || "",
      alternativePhoneNumber: (formData as any).alternativePhone || "",
      email: formData.email || "",
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
      address: formData.address || "",
      suburb: formData.suburb || "",
      city: formData.city || "",
      province: formData.state || "",
      postalCode: formData.zipCode || "",
    }
  });
  
  // Watch for phone number changes
  const idNumberValue = watch('idNumber');
  const phoneNumber = watch('phoneNumber');
  const alternativePhoneNumber = watch('alternativePhoneNumber');
  
  // Check if alternative phone number is the same as the main phone number
  useEffect(() => {
    if (alternativePhoneNumber && phoneNumber && alternativePhoneNumber === phoneNumber) {
      setError('alternativePhoneNumber', {
        type: 'manual',
        message: 'Alternative phone number must be different from your main phone number'
      });
    } else if (alternativePhoneNumber) {
      // Clear the error if it was set and the numbers are now different
      clearErrors('alternativePhoneNumber');
    }
  }, [phoneNumber, alternativePhoneNumber, setError, clearErrors]);
  
  // Parse ID number when it changes
  useEffect(() => {
    if (idNumberValue && idNumberValue.length === 13) {
      const parsedInfo = parseSouthAfricanID(idNumberValue);
      setIdInfo(parsedInfo);
      
      // If we have valid parsed info, update dateOfBirth and gender in the form data
      if (parsedInfo) {
        // Check if the applicant is at least 18 years old
        if (parsedInfo.age < 18) {
          toast.error("You must be at least 18 years old to apply for a loan");
          // Set error for ID number field
          setError('idNumber', {
            type: 'manual',
            message: 'You must be at least 18 years old to apply for a loan'
          });
        } else {
          // Clear any age-related errors
          clearErrors('idNumber');
          
          // Note: These fields will be stored in formData but aren't part of the validation schema
          updateFormData({
            dateOfBirth: parsedInfo.formattedBirthDate,
            gender: parsedInfo.gender.toLowerCase(),
            age: parsedInfo.age
          });
        }
      }
    } else {
      setIdInfo(null);
    }
  }, [idNumberValue, updateFormData, setError, clearErrors]);
  
  const onSubmit = (data: PersonalInfoFormData) => {
    // Check if alternative phone number is the same as the main phone number
    if (data.phoneNumber === data.alternativePhoneNumber) {
      setError('alternativePhoneNumber', {
        type: 'manual',
        message: 'Alternative phone number must be different from your main phone number'
      });
      return;
    }
    
    if (!isValid) {
      setShowAllErrors(true);
      toast.error("Please fill in all required fields correctly");
      return;
    }
    
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Check if address fields are filled
    if (!data.address) {
      toast.error("Please enter your street address");
      return;
    }
    
    // Check if terms are accepted
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    
    // Extract idInfo if available
    const idData = idInfo ? {
      dateOfBirth: idInfo.formattedBirthDate,
      gender: idInfo.gender.toLowerCase(),
      age: idInfo.age
    } : {};
    
    // Prepare the form data
    const formDataToUpdate = {
      firstName: data.firstName,
      lastName: data.lastName,
      idNumber: data.idNumber,
      phone: data.phoneNumber,
      // Use type assertion to avoid TypeScript errors
      ...{ alternativePhone: data.alternativePhoneNumber },
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      address: data.address,
      suburb: data.suburb || '',
      city: data.city || '',
      state: data.province || '',
      zipCode: data.postalCode || '',
      ...idData
    };
    
    // Update the form context data
    updateFormData(formDataToUpdate);
    
    // Move to next step
    nextStep();
  };
  
  const handleAddressSelect = (address: any) => {
    setValue('address', address.street);
    setValue('suburb', address.suburb);
    setValue('city', address.city);
    setValue('province', address.province);
    setValue('postalCode', address.postalCode);
  };

  const filteredAddresses = searchQuery 
    ? addressSuggestions.filter(addr => 
        addr.fullAddress.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : addressSuggestions;
  
  // Function to validate all fields before submission
  const validateAllFields = async () => {
    const result = await trigger();
    if (!result) {
      setShowAllErrors(true);
      toast.error("Please fix all highlighted errors before continuing");
    }
    return result;
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName" className="label">First Name</Label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input 
                  id="firstName"
                  className={`form-input ${(errors.firstName || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="John"
                  {...field}
                />
              )}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
            )}
            {showAllErrors && !errors.firstName && !watch('firstName') && (
              <p className="text-sm text-destructive mt-1">First name is required</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="lastName" className="label">Last Name</Label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input 
                  id="lastName"
                  className={`form-input ${(errors.lastName || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="Doe"
                  {...field}
                />
              )}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
            )}
            {showAllErrors && !errors.lastName && !watch('lastName') && (
              <p className="text-sm text-destructive mt-1">Last name is required</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="idNumber" className="label">SA ID Number</Label>
            <Controller
              name="idNumber"
              control={control}
              render={({ field }) => (
                <Input 
                  id="idNumber"
                  className={`form-input ${(errors.idNumber || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="9001010000000"
                  maxLength={13}
                  {...field}
                />
              )}
            />
            {errors.idNumber && (
              <p className="text-sm text-destructive mt-1">{errors.idNumber.message}</p>
            )}
            {showAllErrors && !errors.idNumber && !watch('idNumber') && (
              <p className="text-sm text-destructive mt-1">ID number is required</p>
            )}
            
            {/* Display extracted info when ID number is valid */}
            {idInfo && !errors.idNumber && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700">ID Information:</p>
                    <ul className="text-blue-600 mt-1 space-y-1">
                      <li>Birth Date: {idInfo.formattedBirthDate}</li>
                      <li>Age: {idInfo.age} years</li>
                      <li>Gender: {idInfo.gender}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="label">Cellphone Number</Label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input 
                  id="phoneNumber"
                  className={`form-input ${(errors.phoneNumber || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="0123456789"
                  {...field}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>
            )}
            {showAllErrors && !errors.phoneNumber && !watch('phoneNumber') && (
              <p className="text-sm text-destructive mt-1">Phone number is required</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="alternativePhoneNumber" className="label">Alternative Contact Number</Label>
            <Controller
              name="alternativePhoneNumber"
              control={control}
              render={({ field }) => (
                <Input 
                  id="alternativePhoneNumber"
                  className={`form-input ${(errors.alternativePhoneNumber || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="0123456789"
                  {...field}
                />
              )}
            />
            {errors.alternativePhoneNumber && (
              <p className="text-sm text-destructive mt-1">{errors.alternativePhoneNumber.message}</p>
            )}
            {showAllErrors && !errors.alternativePhoneNumber && !watch('alternativePhoneNumber') && (
              <p className="text-sm text-destructive mt-1">Alternative phone number is required</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Must be different from your main phone number</p>
          </div>
          
          <div>
            <Label htmlFor="email" className="label">Email Address</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input 
                  id="email"
                  type="email"
                  className={`form-input ${(errors.email || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="john.doe@example.com"
                  {...field}
                />
              )}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
            {showAllErrors && !errors.email && !watch('email') && (
              <p className="text-sm text-destructive mt-1">Email is required</p>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="password" className="label">Password</Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${(errors.password || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                    placeholder="••••••••"
                    {...field}
                  />
                )}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
            {showAllErrors && !errors.password && !watch('password') && (
              <p className="text-sm text-destructive mt-1">Password is required</p>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword" className="label">Confirm Password</Label>
            <div className="relative">
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-input ${(errors.confirmPassword || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                    placeholder="••••••••"
                    {...field}
                  />
                )}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
            {showAllErrors && !errors.confirmPassword && !watch('confirmPassword') && (
              <p className="text-sm text-destructive mt-1">Confirm password is required</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Physical Address</h2>
        <p className="text-foreground/70 mb-4">Start typing your address to see suggestions from Google Maps</p>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label htmlFor="address" className="label">Street Address</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input 
                  id="address"
                  className={`form-input ${(errors.address || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                  placeholder="123 Main Street"
                  {...field}
                />
              )}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
            )}
            {showAllErrors && !errors.address && !watch('address') && (
              <p className="text-sm text-destructive mt-1">Address is required</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="suburb" className="label">Suburb</Label>
              <Controller
                name="suburb"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="suburb"
                    className={`form-input ${(errors.suburb || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                    placeholder="Suburb"
                    {...field}
                  />
                )}
              />
              {errors.suburb && (
                <p className="text-sm text-destructive mt-1">{errors.suburb.message}</p>
              )}
              {showAllErrors && !errors.suburb && !watch('suburb') && (
                <p className="text-sm text-destructive mt-1">Suburb is required</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="city" className="label">City</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="city"
                    className={`form-input ${(errors.city || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                    placeholder="City"
                    {...field}
                  />
                )}
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
              {showAllErrors && !errors.city && !watch('city') && (
                <p className="text-sm text-destructive mt-1">City is required</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="province" className="label">Province</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={`w-full justify-between ${(errors.province || (showAllErrors && !watch('province'))) ? 'border-destructive' : ''}`}
                  >
                    {watch('province') || "Select a province"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <div className="max-h-[200px] overflow-y-auto">
                    {provinces.map((province) => (
                      <div
                        key={province}
                        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-accent ${
                          watch('province') === province ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setValue('province', province);
                          clearErrors('province');
                        }}
                      >
                        <span>{province}</span>
                        {watch('province') === province && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.province && (
                <p className="text-sm text-destructive mt-1">{errors.province.message}</p>
              )}
              {showAllErrors && !errors.province && !watch('province') && (
                <p className="text-sm text-destructive mt-1">Province is required</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="postalCode" className="label">Postal Code</Label>
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="postalCode"
                    className={`form-input ${(errors.postalCode || (showAllErrors && !field.value)) ? 'border-destructive' : ''}`}
                    placeholder="0000"
                    maxLength={4}
                    {...field}
                  />
                )}
              />
              {errors.postalCode && (
                <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
              )}
              {showAllErrors && !errors.postalCode && !watch('postalCode') && (
                <p className="text-sm text-destructive mt-1">Postal code is required</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <input 
          type="checkbox" 
          id="terms" 
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className={`rounded border-gray-300 text-primary focus:ring-primary ${showAllErrors && !termsAccepted ? 'border-destructive' : ''}`}
        />
        <label htmlFor="terms" className={`text-sm ${showAllErrors && !termsAccepted ? 'text-destructive' : ''}`}>
          I accept the <a href="#" className="text-primary hover:underline">terms and conditions</a>
        </label>
      </div>
      {showAllErrors && !termsAccepted && (
        <p className="text-sm text-destructive mt-1">You must accept the terms and conditions</p>
      )}
      
      <div className="flex justify-end mt-8">
        <button 
          type="button"
          className="btn-primary min-w-[150px]"
          onClick={async () => {
            // First validate all fields
            const isValid = await validateAllFields();
            if (isValid) {
              handleSubmit(onSubmit)();
            }
          }}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
