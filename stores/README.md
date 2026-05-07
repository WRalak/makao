# Zustand Stores

This directory contains Zustand stores for state management in the Makao application.

## Available Stores

### 1. Auth Store (`auth-store.ts`)
Manages user authentication state.

```typescript
import { useAuthStore } from '@/stores';

// In your component
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    // Your login logic
    const userData = { id: 1, name: 'John', email: 'john@example.com', role: 'agent' };
    const token = 'your-jwt-token';
    login(userData, token);
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Property Store (`property-store.ts`)
Manages property listings and filters.

```typescript
import { usePropertyStore } from '@/stores';

function PropertyList() {
  const { 
    properties, 
    isLoading, 
    filters, 
    setFilters, 
    filteredProperties 
  } = usePropertyStore();

  const filtered = filteredProperties();

  return (
    <div>
      <input 
        type="text"
        placeholder="Search properties..."
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      />
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {filtered.map(property => (
            <div key={property.id}>
              <h3>{property.title}</h3>
              <p>{property.price} KES</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Message Store (`message-store.ts`)
Manages conversations and messages.

```typescript
import { useMessageStore } from '@/stores';

function ChatComponent() {
  const { 
    conversations, 
    currentConversation, 
    messages, 
    setCurrentConversation,
    addMessage 
  } = useMessageStore();

  const currentMessages = currentConversation 
    ? messages.filter(m => m.conversationId === currentConversation)
    : [];

  return (
    <div>
      <div>
        {conversations.map(conv => (
          <div 
            key={conv.id}
            onClick={() => setCurrentConversation(conv.id)}
          >
            <h4>{conv.otherUserName}</h4>
            <p>{conv.propertyTitle}</p>
          </div>
        ))}
      </div>
      
      <div>
        {currentMessages.map(message => (
          <div key={message.id}>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Usage Tips

1. **Import from central index**: Use `import { useAuthStore } from '@/stores';` for cleaner imports
2. **Persistence**: Auth store is persisted to localStorage automatically
3. **Type Safety**: All stores are fully typed with TypeScript interfaces
4. **Performance**: Zustand is optimized for performance and prevents unnecessary re-renders

## Store Structure

- `auth-store.ts`: User authentication, login/logout, user data
- `property-store.ts`: Property listings, filtering, search
- `message-store.ts`: Real-time messaging, conversations
- `index.ts`: Central exports for easy importing
