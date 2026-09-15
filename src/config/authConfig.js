/**
 * Global App & Authentication Configuration
 * 
 * You can toggle features on/off here easily without modifying complex components.
 */

export const AUTH_CONFIG = {
  // =========================================================================
  // 🔘 TOGGLE DEMO QUICK LOGIN SECTION
  // Set to true  -> Shows the "Demo Quick Login" section on the Login screen
  // Set to false -> Hides the "Demo Quick Login" section completely
  // =========================================================================
  SHOW_DEMO_LOGIN: true,
  ENABLE_INSTANT_SIGN_IN: true, // alias

  // Default credentials used by the Quick Login demo
  DEMO_ACCOUNT: {
    label: 'UIU',
    name: 'Unknown',
    email: 'unknown@bscse.uiu.ac.bd',
    password: 'password123',
    university: 'United International University (UIU)',
    department: 'BSc in Computer Science & Engineering',
  },

  // Toggle University SSO buttons
  ENABLE_SSO_OPTIONS: true,
};
