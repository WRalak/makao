# Backend Integration Documentation

This document outlines the backend integration for the PropRent agent dashboard.

## Overview

The agent dashboard is now fully integrated with the backend APIs, providing real-time data synchronization, proper error handling, and a seamless user experience.

## API Endpoints

### Dashboard API
- **Endpoint**: `/api/agent/dashboard`
- **Method**: GET
- **Authentication**: Required (Bearer token)
- **Response**:
  ```json
  {
    "totalProperties": number,
    "activeProperties": number,
    "totalViews": number,
    "totalMessages": number,
    "subscriptionStatus": string,
    "subscriptionPlan": string,
    "propertyLimit": number,
    "recentProperties": Array,
    "monthlyViews": Array,
    "topProperties": Array
  }
  ```

### Messages API
- **Endpoint**: `/api/messages`
- **Method**: GET
- **Authentication**: Required (Bearer token)
- **Response**: Array of conversations with last message details

### Properties API
- **Endpoint**: `/api/agent/properties`
- **Method**: GET
- **Authentication**: Required (Bearer token)
- **Response**: Array of agent's properties

## Frontend Integration

### API Client

A centralized API client (`/lib/api-client.ts`) provides:
- Automatic token management
- Consistent error handling
- Type-safe API calls
- Request/response interceptors

### Key Features

#### 1. Real-time Data Updates
- Dashboard data refreshes every 30 seconds
- Manual refresh available via time range selector
- Automatic retry on network failures

#### 2. Error Handling
- Graceful fallback to sample data on API failures
- Authentication error detection and redirect
- User-friendly error messages
- Loading states for better UX

#### 3. Authentication
- Automatic token extraction from cookies
- Token validation on each request
- Redirect to login on authentication failure

## Data Flow

```
Dashboard Component
    ↓
API Client (lib/api-client.ts)
    ↓
Backend API Routes
    ↓
Database (PostgreSQL)
```

## State Management

### Dashboard Stats
- `totalProperties`: Total number of properties
- `activeListings`: Currently active properties
- `totalViews`: Cumulative property views
- `newMessages`: Unread message count
- `monthlyViews`: Views in current month
- `monthlyRevenue`: Revenue for current month

### Loading States
- `isLoading`: Global loading state
- `error`: Error state for API failures
- Skeleton loaders for metric cards

## Time Range Filtering

The dashboard supports time-based filtering:
- Last 7 days (default)
- Last 30 days
- Last 3 months
- Last year

## Error Recovery

### Network Errors
- Automatic retry mechanism
- Fallback to cached data
- User notification of issues

### Authentication Errors
- Detection of invalid/expired tokens
- Automatic redirect to login page
- Clear error messaging

### API Errors
- Proper error message display
- Graceful degradation
- Sample data fallback

## Performance Optimizations

1. **Memoization**: Expensive calculations are memoized
2. **Debouncing**: Time range changes are debounced
3. **Caching**: API responses are cached where appropriate
4. **Lazy Loading**: Components load data as needed

## Security Considerations

1. **Token Management**: Secure token storage and transmission
2. **Input Validation**: Client-side and server-side validation
3. **CORS**: Proper cross-origin resource sharing
4. **Rate Limiting**: API request rate limiting

## Monitoring and Logging

- API request/response logging
- Error tracking and reporting
- Performance metrics collection
- User interaction analytics

## Development Guidelines

### Adding New API Endpoints

1. Add the endpoint to `lib/api-client.ts`
2. Define proper TypeScript interfaces
3. Implement error handling
4. Add loading states where needed
5. Test authentication flows

### Testing

- Mock API responses for testing
- Test error scenarios
- Verify authentication flows
- Performance testing under load

## Future Enhancements

1. **WebSocket Integration**: Real-time updates without polling
2. **Offline Support**: Service worker for offline functionality
3. **Advanced Caching**: Intelligent caching strategies
4. **Analytics Dashboard**: Enhanced analytics and reporting
5. **Push Notifications**: Real-time notifications for important events

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check token validity
   - Verify cookie settings
   - Ensure proper CORS configuration

2. **Data Not Loading**
   - Check network connectivity
   - Verify API endpoint availability
   - Check browser console for errors

3. **Performance Issues**
   - Monitor API response times
   - Check for memory leaks
   - Optimize database queries

### Debug Mode

Enable debug mode by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will provide additional logging and error details.

## API Response Examples

### Successful Dashboard Response
```json
{
  "totalProperties": 24,
  "activeProperties": 18,
  "totalViews": 15420,
  "totalMessages": 7,
  "subscriptionStatus": "active",
  "subscriptionPlan": "premium",
  "propertyLimit": 50,
  "recentProperties": [
    {
      "_id": "1",
      "title": "Modern Westlands Apartment",
      "address": {
        "street": "Westlands Road",
        "city": "Nairobi",
        "state": "Kenya"
      },
      "status": "available",
      "views": 234,
      "messagesCount": 12,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "monthlyViews": [
    {
      "year": 2024,
      "month": 1,
      "views": 2340,
      "messages": 45,
      "properties": 3
    }
  ],
  "topProperties": [
    {
      "_id": "1",
      "title": "Luxury Karen Villa",
      "views": 412,
      "messagesCount": 15,
      "address": {
        "city": "Nairobi",
        "state": "Kenya"
      }
    }
  ]
}
```

### Error Response
```json
{
  "error": "Authentication required",
  "status": 401
}
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## Deployment Considerations

1. **API Rate Limiting**: Implement rate limiting in production
2. **Database Connections**: Use connection pooling
3. **Caching**: Implement Redis for session caching
4. **Monitoring**: Set up application monitoring
5. **Backup**: Regular database backups

This integration provides a robust foundation for the PropRent agent dashboard with proper error handling, real-time updates, and excellent user experience.
