/**
 * Debug utilities for validation system
 * 
 * Helps identify and troubleshoot validation issues during development.
 */

import { GenerationParamsSchema, validateGenerationParams } from './schemas';

/**
 * Test validation with sample data
 */
export function testValidation() {
  console.log('Testing validation system...');
  
  // Test 1: Valid data
  const validData = {
    prompt: 'This is a valid prompt with enough characters to pass validation',
    audience: 'general',
    tone: 'professional',
    contentLength: 'moderate',
    presentationType: 'business'
  };
  
  console.log('Test 1 - Valid data:', validData);
  try {
    const result1 = validateGenerationParams(validData);
    console.log('Result 1:', result1);
  } catch (error) {
    console.error('Error in test 1:', error);
  }
  
  // Test 2: Invalid prompt (too short)
  const invalidData = {
    prompt: 'short',
    audience: 'general',
    tone: 'professional'
  };
  
  console.log('Test 2 - Invalid data:', invalidData);
  try {
    const result2 = validateGenerationParams(invalidData);
    console.log('Result 2:', result2);
  } catch (error) {
    console.error('Error in test 2:', error);
  }
  
  // Test 3: Empty data
  console.log('Test 3 - Empty data');
  try {
    const result3 = validateGenerationParams({});
    console.log('Result 3:', result3);
  } catch (error) {
    console.error('Error in test 3:', error);
  }
  
  // Test 4: Null/undefined data
  console.log('Test 4 - Null data');
  try {
    const result4 = validateGenerationParams(null);
    console.log('Result 4:', result4);
  } catch (error) {
    console.error('Error in test 4:', error);
  }
  
  console.log('Validation testing complete.');
}

/**
 * Debug schema structure
 */
export function debugSchema() {
  console.log('Schema structure:');
  console.log('GenerationParamsSchema:', GenerationParamsSchema);
  
  try {
    // Try to parse empty object to see what errors we get
    const result = GenerationParamsSchema.safeParse({});
    console.log('SafeParse empty object:', result);
    
    if (!result.success) {
      console.log('Error details:', result.error);
      if (result.error.errors) {
        console.log('Error.errors:', result.error.errors);
      }
    }
  } catch (error) {
    console.error('Error in debugSchema:', error);
  }
}

/**
 * Run all debug tests
 */
export function runDebugTests() {
  console.log('=== Validation Debug Tests ===');
  debugSchema();
  testValidation();
  console.log('=== Debug Tests Complete ===');
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Delay to ensure everything is loaded
  setTimeout(() => {
    runDebugTests();
  }, 1000);
}
