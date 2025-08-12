# State Management in This Project

This project uses Zustand for global state management and React's useState for local state.

## 1. Zustand (Global State)

### Architecture:
The project uses a modular Zustand architecture with separate stores for different concerns:

- **User Store** (`useUserStore.ts`) - Authentication and user management
- **UI Store** (`useUIStore.ts`) - Search, view preferences, and UI state  
- **Error Store** (`useErrorStore.ts`) - Global error handling

### Where it's used:
- **User Authentication State** (User Store)
- **Search and View State** (UI Store)
- **Global Error State** (Error Store)

### How it works:
- Each store is responsible for a specific domain following encapsulation principles
- Components import only the stores they need
- Example usage:
  ```tsx
  import { useUserStore, useUIStore, useErrorStore } from '../store';
  const { user, login, logout } = useUserStore();
  const { search, setSearch, view, setView } = useUIStore();
  const { error, showError, clearError } = useErrorStore();
  ```
- This avoids prop drilling and makes global state available everywhere in the app while maintaining clean separation of concerns.

---

## 2. Local State with useState

### Where it's used:
- **Component-specific state** such as form fields, temporary UI toggles, etc.
- Examples: `RegisterPage.tsx` (form fields), `AddMovieForm.tsx` (form fields), `MovieCard.tsx` (hover/video state).

### How it works:
- State is managed locally within each component using the `useState` hook.
- Example:
  ```tsx
  const [name, setName] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  ```
- Local state is used for data that does not need to be shared globally.

---

## 3. Prop Drilling (Minimized)

- Most shared state is now managed by Zustand, so prop drilling is minimized.
- Local state and handlers may still be passed as props for isolated UI logic.

---

## Summary Table

| State Type         | Store Used                | How Shared                |
|--------------------|---------------------------|---------------------------|
| User (auth)        | User Store                | Zustand (global)          |
| Search/View        | UI Store                  | Zustand (global)          |
| Error              | Error Store               | Zustand (global)          |
| Form Fields        | RegisterPage, AddMovieForm| useState (local)          |
| Movie Data         | Home, MovieList, MovieCard| useState + props          |

---

## Recommendations
- For global/shared state (like user, search, view, error), use Zustand or another state manager.
- For local state (form fields, UI toggles), use `useState`.
- Avoid prop drilling for deeply nested or widely shared state by using Zustand or a similar solution.

---

**For more info on Zustand:**
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
