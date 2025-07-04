
# Authentication: Forgot Password and Reset Password

## Description

This document outlines the implementation of the Forgot Password and Reset Password features within the application. These features allow users to regain access to their accounts if they forget their password by providing a secure way to reset it via email.

## Relevant Files

*   `src/app/auth/forgot-password/page.tsx`: The user interface component for requesting a password reset email.
*   `src/app/auth/reset-password/page.tsx`: The user interface component for entering and confirming a new password using a reset link.
*   `src/lib/auth-utils.ts`: Contains utility functions for interacting with Firebase Authentication, including sending password reset emails and confirming password resets.
*   `src/lib/form-schemas.ts`: Defines the validation schemas for the Forgot Password and Reset Password forms using Zod.

## Flow Overview

The Forgot Password and Reset Password flow follows these high-level steps:

1.  **User Requests Reset:** A user navigates to the "Forgot Password" page (`/auth/forgot-password`) and enters their email address.
2.  **Email Sent:** The application calls the `sendPasswordReset` function in `src/lib/auth-utils.ts`, which uses Firebase Authentication to send a password reset email to the provided email address.
3.  **User Clicks Link:** The user receives the email and clicks on the unique password reset link provided. This link contains an `oobCode` parameter.
4.  **User Sets New Password:** The user is directed to the "Reset Password" page (`/auth/reset-password`). The page extracts the `oobCode` from the URL. The user enters and confirms their new password in the provided form.
5.  **Password Reset Confirmed:** Upon submitting the form, the application calls the `resetPassword` function in `src/lib/auth-utils.ts`, passing the `oobCode` and the new password to Firebase Authentication's `confirmPasswordReset` method. Firebase verifies the `oobCode` and updates the user's password.
6.  **Success and Redirect:** If the password reset is successful, the user is notified and typically redirected to the Sign In page.

## Security Considerations

While Firebase Authentication handles many security aspects of this flow, it is important to note that for a production environment, implementing **backend validation** of inputs and **rate limiting** on the Forgot Password request endpoint are crucial to prevent malicious attacks such as brute-force attempts and user enumeration.

## Technology

This feature leverages **Firebase Authentication** to securely handle the sending of password reset emails and the confirmation of password resets. The frontend uses `react-hook-form` and `Zod` for client-side form management and validation.
