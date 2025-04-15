# JB Capital LMS Changes Checklist

## Personal Information
- [x] Add field: Alternative Contact Number
- [x] Make all fields mandatory

## Employment Information
- [x] Add required fields:
  - [x] Work Address
  - [x] City/Country
  - [x] Postal Code
  - [x] Work Email
  - [x] Work Contact Number
- [x] Make all employment information fields mandatory

## Financial Information
- [x] Implement a full Affordability Assessment Tool with required fields:
  - [x] Monthly Income
  - [x] Monthly Expenses
  - [x] Existing Credit Obligations
  - [x] Additional Relevant Financial Information
- [x] Make all fields mandatory (no optional fields)

## Document Upload Requirements
- [x] Ensure the following mandatory documents:
  - [x] Valid Identification Document
  - [x] Selfie holding the ID document (new requirement)
  - [x] Latest 3 months' payslips (employment letters not accepted)
  - [x] Latest 3 months' bank statements
  - [x] Proof of Address
- [x] Add optional document:
  - [x] Employment Verification Document

## Documents Tab
- [x] Ensure upload requirements match the Document Upload Requirements section

## Eligibility Tab
- [ ] Refinement needed (TBC)

## Technical Implementation
- [x] Fix linter errors in type interfaces:
  - [x] Update FormData interface in formContext.tsx
  - [x] Update User interface in AppDataContext.tsx
  - [x] Fix type assertions in PersonalInfoForm.tsx
  - [x] Fix type assertions in EmploymentForm.tsx
  - [x] Fix type assertions in FinancialForm.tsx
- [x] Fix additional linter errors in AppDataContext.tsx:
  - [x] Fix toast calls format from object to method style
  - [x] Add missing arguments to generateId() calls
  - [x] Fix mockUsers type structure in generateMockData()
  - [x] Remove unused loadMockData() function with incorrect references

## Data Accessibility and Display
- [x] Update user profile display in admin dashboard to show all new fields:
  - [x] Show Alternative Contact Number in personal information
  - [x] Display Work Contact Information (Email, Phone, Address)
  - [x] Show Account Number and Additional Financial Information
  - [x] Include Debt to Income Ratio calculation
- [x] Update review application page to show all entered information
  - [x] Update Personal Information accordion
  - [x] Update Employment Information accordion
  - [x] Update Financial Information accordion
- [x] Ensure user data is properly saved and accessible in the admin side
  - [x] Update createDefaultUser function to include all fields 