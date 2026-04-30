# React Templates Roadmap

## Current Add-ons
- ✅ Tailwind CSS
- ✅ Shadcn UI
- ✅ React Router
- ✅ TanStack Router
- ✅ React Router Framework

---

## Proposed Add-ons

### High-Impact Additions

#### 1. State Management (Zustand)
**Rationale:** Lightweight alternative to Redux; very popular in modern React.
- **Package:** `zustand`
- **Key Files:**
  - `src/store/index.ts` - Store setup
  - `src/hooks/useStore.ts` - Custom hook example
- **Dependencies:** zustand
- **Notes:**
  - Minimal API surface, DevTools support
  - Pairs well with all other add-ons
  - No boilerplate

#### 2. API Client (TanStack Query)
**Rationale:** Industry standard for data fetching, caching, and synchronization.
- **Package:** `@tanstack/react-query`
- **Key Files:**
  - `src/lib/queryClient.ts` - Client config
  - `src/hooks/useApi.ts` - Custom hook for common queries
  - `src/api/index.ts` - API endpoints setup
- **Dependencies:** @tanstack/react-query
- **Notes:**
  - Automatic caching and background refetch
  - DevTools support
  - Works with any HTTP client (axios, fetch)

#### 3. Authentication (JWT Setup)
**Rationale:** Most apps need auth; provides templates for common flows.
- **Package:** None (custom setup)
- **Key Files:**
  - `src/context/AuthContext.tsx` - Auth state management
  - `src/hooks/useAuth.ts` - Auth hook
  - `src/lib/auth.ts` - JWT handling utilities
  - `src/components/ProtectedRoute.tsx` - Route guard
- **Notes:**
  - JWT token storage (localStorage/sessionStorage)
  - Login/logout flows
  - Token refresh mechanism

#### 4. Testing Framework (Vitest + React Testing Library)
**Rationale:** Unit/component testing; helps users write quality code immediately.
- **Packages:** `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
- **Key Files:**
  - `vitest.config.ts` - Test config
  - `src/__tests__/setup.ts` - Test setup
  - `src/components/__tests__/Example.test.tsx` - Example test
- **Dev Dependencies:** vitest, @testing-library/react, @testing-library/user-event, jsdom
- **Scripts:** `test`, `test:watch`, `test:coverage`
- **Notes:**
  - Fast, ESM-native
  - Full component testing coverage

#### 5. Form Handling (React Hook Form + Zod)
**Rationale:** Type-safe forms with minimal re-renders and validation.
- **Packages:** `react-hook-form`, `zod`
- **Key Files:**
  - `src/schemas/index.ts` - Zod validation schemas
  - `src/hooks/useForm.ts` - Wrapper around react-hook-form
  - `src/components/Form.tsx` - Reusable form component
- **Dependencies:** react-hook-form, zod
- **Notes:**
  - Zero dependencies alternative to Formik
  - Excellent TypeScript support
  - Minimal re-renders

---

### Nice-to-Have Additions

#### 6. Database ORM (Prisma)
**Rationale:** For full-stack projects; setup instructions + schema template.
- **Package:** `@prisma/client`, `prisma` (dev)
- **Key Files:**
  - `prisma/schema.prisma` - Database schema template
  - `.env.example` - Environment variables template
  - `src/lib/db.ts` - Prisma client singleton
- **Notes:**
  - Best for Node.js backends
  - Migrations system
  - Type-safe queries

#### 7. Dark Mode (Tailwind + System Preference)
**Rationale:** Quick toggle system; pairs well with Tailwind.
- **Key Files:**
  - `src/hooks/useDarkMode.ts` - Dark mode hook
  - `src/components/ThemeToggle.tsx` - UI toggle component
  - Updated `tailwind.config.ts` with dark mode config
- **Notes:**
  - System preference detection
  - localStorage persistence
  - CSS custom properties for colors

#### 8. Animations (Framer Motion)
**Rationale:** Enhance UI with smooth animations; popular choice.
- **Package:** `framer-motion`
- **Key Files:**
  - `src/components/AnimatedButton.tsx` - Example animated component
  - `src/animations/variants.ts` - Reusable animation variants
  - Documentation on common patterns
- **Notes:**
  - Gesture support
  - Layout animations
  - CSS-like syntax

---

## Implementation Priority

**Phase 1 (MVP):**
1. State Management (Zustand)
2. API Client (TanStack Query)
3. Form Handling (React Hook Form + Zod)

**Phase 2:**
4. Testing Framework (Vitest + React Testing Library)
5. Authentication (JWT)

**Phase 3:**
6. Database ORM (Prisma)
7. Dark Mode
8. Animations (Framer Motion)

---

## Technical Considerations

- **EJS Templates:** All add-ons should use `.ejs` files where configuration varies
- **Package Merging:** Use existing lodash.merge strategy in `app/scaffold.js`
- **Conditional Imports:** Use `<% if (config.hasXXX) %>` for optional features
- **Documentation:** Each add-on should include usage examples
- **Compatibility:** Ensure add-ons work together (e.g., Auth + Query, Forms + Validation)
