# Mixpanel Integration Test Guide - Mobile App (kudya-client)

## Overview
This guide helps you test the Mixpanel integration in the Kudya customer mobile app (React Native).

## Configuration
- **Token**: `a8cf933c3054afed7f397f71249ba506`
- **SDK**: `mixpanel-react-native` v3.1.2
- **Features**: Automatic events enabled

## Test Scenarios

### 1. App Launch
1. Open the app
2. **Expected Event**: `App Opened`
3. Verify in Mixpanel Live View

### 2. Authentication Flow

#### Login Test
1. Navigate to Login Screen
2. **Expected Event**: `Screen View` with screen = "Login Screen"
3. Enter credentials and login
4. **Expected Events**:
   - Success: `User Login` with user_type = "customer", platform = "mobile"
   - Failure: `Error Occurred` with error_message = "Login Failed"

#### Signup Test
1. Navigate to Signup Screen
2. **Expected Event**: `Screen View` with screen = "Signup Screen"
3. Complete signup
4. **Expected Events**:
   - Success: `User Signup` with name, email, user_type = "client" or "store", platform = "mobile"
   - Failure: `Error Occurred` with error_message = "Signup Failed"

### 3. Home Screen
1. Navigate to Home Screen
2. **Expected Event**: `Screen View` with screen = "Home Screen"

### 4. Shopping Flow

#### View Products
1. Browse products
2. Verify automatic screen tracking

#### Cart Operations
1. Navigate to Cart Screen
2. **Expected Event**: `Screen View` with screen = "Cart Screen", items_count
3. Remove an item
4. **Expected Event**: `Product Removed from Cart` with product_id, product_name

## Testing on Different Platforms

### iOS Testing
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
expo run:ios
```

### Android Testing
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
expo run:android
```

### Development Testing
```bash
cd /Users/ludmil/Desktop/Apps/kudya-client
npm start
```

## Verification Steps

### React Native Debugger
1. Open React Native Debugger
2. Check Console for Mixpanel logs
3. Look for event tracking confirmations

### Mixpanel Dashboard
1. Go to [Mixpanel Dashboard](https://mixpanel.com)
2. Navigate to Events → Live View
3. Verify events appear with correct properties
4. Check user profiles are being created/updated

### Device-Specific Testing
1. Test on both iOS and Android
2. Verify events from both platforms
3. Check that platform property is set correctly

## Debug Mode

To enable debug logging, the Mixpanel instance is initialized with automatic events enabled:
```typescript
const mixpanel = new Mixpanel(MIXPANEL_TOKEN, true);
```

## Event Properties to Verify

### User Properties
- `$name`: User's name
- `$email`: User's email  
- `user_type`: "customer" or specific role
- `platform`: "mobile"
- `signup_date`: ISO timestamp

### Event-Specific Properties
- **Screen Views**: screen name
- **User Actions**: user_id, action details
- **Errors**: error_message, error_details
- **Cart**: product_id, product_name, price, quantity

## Common Issues

### Events Not Appearing
- Check internet connection
- Verify Mixpanel token is correct
- Ensure Mixpanel SDK is initialized before tracking
- Check if tracking permissions are granted

### User Identification Issues
- Verify `identify()` is called after successful login
- Check user_id is being passed correctly
- Ensure user properties are set with valid data

## Success Criteria
✅ App launch tracked
✅ All screen views recorded
✅ User authentication events captured
✅ Shopping actions tracked
✅ Error events logged
✅ User properties synced
✅ Events visible in Mixpanel dashboard
✅ Both iOS and Android working

## Analytics Class Methods Available

```typescript
// Screen tracking
analytics.trackScreenView(screenName, properties?)

// User management
analytics.identify(userId)
analytics.trackLogin(userId, properties?)
analytics.trackSignup(userId, properties?)
analytics.trackLogout()

// Shopping
analytics.trackProductView(productId, productName, price, storeId?)
analytics.trackAddToCart(productId, productName, price, quantity)
analytics.trackRemoveFromCart(productId, productName)
analytics.trackCheckoutStarted(cartValue, itemCount)
analytics.trackOrderPlaced(orderId, orderValue, items)

// General tracking
analytics.track(eventName, properties?)
analytics.trackError(error, errorDetails?)
```

## Testing Checklist

- [ ] Install app on physical device
- [ ] Complete signup flow
- [ ] Login/Logout
- [ ] Browse products
- [ ] Add items to cart
- [ ] Remove items from cart
- [ ] Complete an order
- [ ] Verify all events in Mixpanel
- [ ] Check user profile is created
- [ ] Test on both iOS and Android

