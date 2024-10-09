// global.d.ts

declare global {
    interface Window {
      gapi: any; // Declares 'gapi' as 'any' (you can later specify the actual types if needed)
      google: any; // Declares 'google' for Google Identity Services
    }
  }
  
  export {};