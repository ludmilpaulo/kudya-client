/**
 * Run: node scripts/print-oauth-redirect.js
 * Register the printed URI in Google, Meta, and TikTok developer consoles.
 */
const { makeRedirectUri } = require('expo-auth-session');

const redirect = makeRedirectUri({ scheme: 'kudya', path: 'oauth' });
console.log('\nKudya OAuth redirect URI (register in all providers):\n');
console.log('  ', redirect);
console.log('\nBundle ID (iOS): com.ludmil.kudyaclient');
console.log('Package (Android): com.ludmil.kudyaclient\n');
