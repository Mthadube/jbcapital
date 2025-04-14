warning: in the working copy of 'src/components/LoanForm/FinancialForm.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/LoanForm/ReviewSubmitForm.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/index.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/pages/Index.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/utils/validation.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/components/LoanForm/FinancialForm.tsx b/src/components/LoanForm/FinancialForm.tsx[m
[1mindex ba6a538..34d84d2 100644[m
[1m--- a/src/components/LoanForm/FinancialForm.tsx[m
[1m+++ b/src/components/LoanForm/FinancialForm.tsx[m
[36m@@ -38,7 +38,6 @@[m [mconst FinancialForm: React.FC = () => {[m
       bankingPeriod: formData.bankingPeriod || 0,[m
       existingLoans: formData.existingLoans || false,[m
       existingLoanAmount: formData.existingLoanAmount || 0,[m
[31m-      creditScore: formData.creditScore || 0,[m
       monthlyDebt: formData.monthlyDebt || 0,[m
       rentMortgage: formData.rentMortgage || 0,[m
       carPayment: formData.carPayment || 0,[m
[36m@@ -60,7 +59,6 @@[m [mconst FinancialForm: React.FC = () => {[m
       if (currentUser.bankingPeriod) setValue('bankingPeriod', currentUser.bankingPeriod);[m
       [m
       // Prefill financial details[m
[31m-      if (currentUser.creditScore) setValue('creditScore', currentUser.creditScore);[m
       if (currentUser.existingLoans !== undefined) setValue('existingLoans', currentUser.existingLoans);[m
       if (currentUser.existingLoanAmount) setValue('existingLoanAmount', currentUser.existingLoanAmount);[m
       if (currentUser.monthlyDebt) setValue('monthlyDebt', currentUser.monthlyDebt);[m
[36m@@ -79,7 +77,6 @@[m [mconst FinancialForm: React.FC = () => {[m
       bankingPeriod: data.bankingPeriod,[m
       existingLoans: data.existingLoans,[m
       existingLoanAmount: data.existingLoanAmount,[m
[31m-      creditScore: data.creditScore,[m
       monthlyDebt: data.monthlyDebt,[m
       rentMortgage: data.rentMortgage,[m
       carPayment: data.carPayment,[m
[1mdiff --git a/src/components/LoanForm/ReviewSubmitForm.tsx b/src/components/LoanForm/ReviewSubmitForm.tsx[m
[1mindex f838d37..54a53ce 100644[m
[1m--- a/src/components/LoanForm/ReviewSubmitForm.tsx[m
[1m+++ b/src/components/LoanForm/ReviewSubmitForm.tsx[m
[36m@@ -274,9 +274,9 @@[m [mconst ReviewSubmitForm: React.FC = () => {[m
               </p>[m
               {!isPhoneVerified && ([m
                 <Button [m
[31m-                  variant="outline" [m
[32m+[m[32m                  variant="primary"[m[41m [m
                   size="sm" [m
[31m-                  className="mt-2" [m
[32m+[m[32m                  className="mt-2 bg-primary text-white hover:bg-primary/90"[m[41m [m
                   onClick={handleVerifyPhone}[m
                   type="button"[m
                 >[m
[1mdiff --git a/src/components/ui/PlacesAutocomplete.tsx b/src/components/ui/PlacesAutocomplete.tsx[m
[1mindex 32b0d63..eb68027 100644[m
[1m--- a/src/components/ui/PlacesAutocomplete.tsx[m
[1m+++ b/src/components/ui/PlacesAutocomplete.tsx[m
[36m@@ -57,7 +57,18 @@[m [mconst PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({[m
         break;[m
       case 'province':[m
         setProvince(value);[m
[31m-        break;[m
[32m+[m[32m        // Immediately update for province changes to fix the issue with "next" not working[m
[32m+[m[32m        setTimeout(() => {[m
[32m+[m[32m          onAddressSelect({[m
[32m+[m[32m            street,[m
[32m+[m[32m            suburb,[m
[32m+[m[32m            city,[m
[32m+[m[32m            province: value, // Use the new value directly[m
[32m+[m[32m            postalCode,[m
[32m+[m[32m            fullAddress: `${street}, ${suburb}, ${city}, ${value}, ${postalCode}`.replace(/, ,/g, ",").replace(/^,|,$/g, "")[m
[32m+[m[32m          });[m
[32m+[m[32m        }, 0);[m
[32m+[m[32m        return; // Skip the general submitAddress call for province[m
       case 'postalCode':[m
         setPostalCode(value);[m
         break;[m
[1mdiff --git a/src/index.css b/src/index.css[m
[1mindex 5cbfb83..a705c50 100644[m
[1m--- a/src/index.css[m
[1m+++ b/src/index.css[m
[36m@@ -173,11 +173,26 @@[m
   [m
   /* Happy people background */[m
   .bg-happy-people {[m
[31m-    background-image: url('happy-people.jpg');[m
[32m+[m[32m    background-image: url('/happy-people.jpg');[m
     background-size: cover;[m
     background-position: center;[m
   }[m
 [m
[32m+[m[32m  /* Loans section background */[m
[32m+[m[32m  .bg-loans-pattern {[m
[32m+[m[32m    background-color: #f8fafc;[m
[32m+[m[32m    background-image:[m[41m [m
[32m+[m[32m      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),[m
[32m+[m[32m      radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);[m
[32m+[m[32m  }[m
[32m+[m[41m  [m
[32m+[m[32m  .dark .bg-loans-pattern {[m
[32m+[m[32m    background-color: #0f172a;[m
[32m+[m[32m    background-image:[m[41m [m
[32m+[m[32m      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),[m
[32m+[m[32m      radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);[m
[32m+[m[32m  }[m
[32m+[m
   /* Step cards */[m
   .step-card {[m
     @apply glass-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2 relative;[m
[1mdiff --git a/src/pages/Index.tsx b/src/pages/Index.tsx[m
[1mindex 1db1723..eebb8e0 100644[m
[1m--- a/src/pages/Index.tsx[m
[1m+++ b/src/pages/Index.tsx[m
[36m@@ -213,8 +213,9 @@[m [mconst Index: React.FC = () => {[m
         </section>[m
         [m
         {/* Loan Types Section */}[m
[31m-        <section className="py-20 bg-white">[m
[31m-          <div className="container-custom">[m
[32m+[m[32m        <section className="py-24 bg-loans-pattern relative overflow-hidden">[m
[32m+[m[32m          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>[m
[32m+[m[32m          <div className="container-custom relative z-10">[m
             <div className="text-center mb-16">[m
               <h2 className="heading-lg">We Offer a Wide Variety of Loans</h2>[m
               <p className="text-lg text-foreground/70 max-w-2xl mx-auto mt-4">[m
[36m@@ -223,7 +224,7 @@[m [mconst Index: React.FC = () => {[m
               </p>[m
             </div>[m
             [m
[31m-            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">[m
[32m+[m[32m            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[m
               {/* Personal Loan Card */}[m
               <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">[m
                 <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 mb-4">[m
[36m@@ -320,13 +321,7 @@[m [mconst Index: React.FC = () => {[m
         {/* CTA Section */}[m
         <section className="py-24 relative overflow-hidden">[m
           {/* Background image */}[m
[31m-          <div className="absolute inset-0" style={{ [m
[31m-            backgroundImage: 'url("/happy-people.jpg")', [m
[31m-            backgroundSize: 'cover',[m
[31m-            backgroundPosition: 'center',[m
[31m-            filter: 'brightness(0.4)',[m
[31m-            opacity: 0.6[m
[31m-          }}></div>[m
[32m+[m[32m          <div className="absolute inset-0 bg-happy-people opacity-60" style={{ filter: 'brightness(0.4)' }}></div>[m
           [m
           {/* Overlay gradient */}[m
           <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-blue-900/80 mix-blend-multiply"></div>[m
