// ========================================
// TEST EXPIRY CONFIGURATION
// ========================================
// 
// INSTRUCTIONS:
// 1. To EXPIRE the test and block all access:
//    Change: const TEST_EXPIRED = false;
//    To:     const TEST_EXPIRED = true;
//
// 2. To RE-ENABLE the test:
//    Change back to: const TEST_EXPIRED = false;
//
// When TEST_EXPIRED = true:
// - Users will see the expire.html page
// - No one can login, register, or access any part of the test
// - The expire.html page cannot be bypassed
// ========================================

const TEST_EXPIRED = true; // <<< CHANGE THIS TO true TO EXPIRE THE TEST

// ========================================
// OPTIONAL: AUTOMATIC EXPIRY BY DATE/TIME
// ========================================
// Uncomment the lines below to automatically expire the test at a specific date/time
// Format: 'YYYY-MM-DD HH:MM:SS' (24-hour format)
// Example: '2025-10-15 23:59:59' = October 15, 2025 at 11:59:59 PM
// 
// const AUTO_EXPIRY_DATE = new Date('2025-10-15 23:59:59');
// if (new Date() > AUTO_EXPIRY_DATE) {
//     TEST_EXPIRED = true;
// }
