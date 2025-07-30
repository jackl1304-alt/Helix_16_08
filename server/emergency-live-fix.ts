// Emergency Live Production Database Fix
// This will be triggered by any route access if legal cases are 0

import { storage } from "./storage-morning.js";

let isFixing = false; // Prevent multiple simultaneous fixes

export async function emergencyLiveFix(): Promise<boolean> {
  if (isFixing) {
    console.log("🔄 Emergency fix already in progress...");
    return false;
  }
  
  isFixing = true;
  
  try {
    console.log("🚨 EMERGENCY LIVE FIX: Checking legal cases count...");
    
    const currentLegalCases = await storage.getAllLegalCases();
    console.log(`Current legal cases: ${currentLegalCases.length}`);
    
    if (currentLegalCases.length === 0) {
      console.log("🚨 ZERO LEGAL CASES IN LIVE: Triggering emergency initialization...");
      
      // Import and run legal data service
      const { legalDataService } = await import("./services/enhancedLegalDataService.js");
      await legalDataService.initializeLegalData();
      
      const updatedLegalCount = await storage.getAllLegalCases();
      console.log(`✅ EMERGENCY FIX COMPLETE: ${updatedLegalCount.length} legal cases now available`);
      
      isFixing = false;
      return true;
    }
    
    isFixing = false;
    return false;
    
  } catch (error) {
    console.error("❌ Emergency live fix error:", error);
    isFixing = false;
    return false;
  }
}