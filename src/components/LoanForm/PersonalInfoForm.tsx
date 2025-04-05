import React, { useState } from 'react';
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
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import PlacesAutocomplete from '@/components/ui/PlacesAutocomplete';

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
  
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      idNumber: formData.idNumber || "",
      phoneNumber: formData.phone,
      email: formData.email,
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
      address: formData.address,
      suburb: formData.suburb || "",
      city: formData.city,
      province: formData.state,
      postalCode: formData.zipCode,
    }
  });
  
  const onSubmit = (data: PersonalInfoFormData) => {
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
    
    // Prepare the form data
    const formDataToUpdate = {
      firstName: data.firstName,
      lastName: data.lastName,
      idNumber: data.idNumber,
      phone: data.phoneNumber,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      address: data.address,
      suburb: data.suburb || '',
      city: data.city || '',
      state: data.province || '',
      zipCode: data.postalCode || '',
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
                  className={`form-input ${errors.firstName ? 'border-destructive' : ''}`}
                  placeholder="John"
                  {...field}
                />
              )}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
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
                  className={`form-input ${errors.lastName ? 'border-destructive' : ''}`}
                  placeholder="Doe"
                  {...field}
                />
              )}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
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
                  className={`form-input ${errors.idNumber ? 'border-destructive' : ''}`}
                  placeholder="9001010000000"
                  {...field}
                />
              )}
            />
            {errors.idNumber && (
              <p className="text-sm text-destructive mt-1">{errors.idNumber.message}</p>
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
                  className={`form-input ${errors.phoneNumber ? 'border-destructive' : ''}`}
                  placeholder="0123456789"
                  {...field}
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>
            )}
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
                  className={`form-input ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="john.doe@example.com"
                  {...field}
                />
              )}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
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
                    className={`form-input ${errors.password ? 'border-destructive' : ''}`}
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
                    className={`form-input ${errors.confirmPassword ? 'border-destructive' : ''}`}
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
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="heading-md mb-6">Physical Address</h2>
        <p className="text-foreground/70 mb-4">Start typing your address to see suggestions from Google Maps</p>
        
        <div className="grid grid-cols-1 gap-6">
          <PlacesAutocomplete
            onAddressSelect={handleAddressSelect}
            error={errors.address?.message}
            defaultValue={watch('address')}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <input 
          type="checkbox" 
          id="terms" 
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary" 
        />
        <label htmlFor="terms" className="text-sm">
          I accept the <a href="#" className="text-primary hover:underline">terms and conditions</a>
        </label>
      </div>
      
      <div className="flex justify-end mt-8">
        <button 
          type="button" 
          onClick={() => {
            const formValues = watch();
            
            // Manually perform validation
            if (!formValues.firstName || formValues.firstName.length < 2) {
              toast.error("First name must be at least 2 characters");
              return;
            }
            
            if (!formValues.lastName || formValues.lastName.length < 2) {
              toast.error("Last name must be at least 2 characters");
              return;
            }
            
            if (!formValues.email || !formValues.email.includes('@')) {
              toast.error("Please enter a valid email address");
              return;
            }
            
            if (!formValues.phoneNumber || !/^0\d{9}$/.test(formValues.phoneNumber)) {
              toast.error("Please enter a valid 10-digit phone number starting with 0");
              return;
            }
            
            if (!formValues.password || formValues.password.length < 8) {
              toast.error("Password must be at least 8 characters");
              return;
            }
            
            if (formValues.password !== formValues.confirmPassword) {
              toast.error("Passwords do not match");
              return;
            }
            
            if (!formValues.address || formValues.address.length < 5) {
              toast.error("Please enter your street address");
              return;
            }
            
            if (!formValues.city || formValues.city.length < 2) {
              toast.error("City must be at least 2 characters");
              return;
            }
            
            if (!formValues.province || formValues.province.length < 2) {
              toast.error("Please select a province");
              return;
            }
            
            if (!formValues.postalCode || !/^\d{4}$/.test(formValues.postalCode)) {
              toast.error("Please enter a valid 4-digit postal code");
              return;
            }
            
            if (!termsAccepted) {
              toast.error("Please accept the terms and conditions");
              return;
            }
            
            // If all validations pass, prepare and update form data
            const formDataToUpdate = {
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              idNumber: formValues.idNumber,
              phone: formValues.phoneNumber,
              email: formValues.email,
              password: formValues.password,
              confirmPassword: formValues.confirmPassword,
              address: formValues.address,
              suburb: formValues.suburb || '',
              city: formValues.city || '',
              state: formValues.province || '',
              zipCode: formValues.postalCode || '',
            };
            
            updateFormData(formDataToUpdate);
            nextStep();
            
            // For extra reliability, try again with goToStep if needed
            setTimeout(() => {
              goToStep(2); 
            }, 100);
          }}
          className="btn-primary min-w-[150px]"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
