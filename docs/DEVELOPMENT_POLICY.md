# DamDoh Development Policy & Microservice Protocol

## 📋 **Table of Contents**
1. [Microservice Architecture Principles](#microservice-architecture-principles)
2. [File Size & Single Responsibility Limits](#file-size--single-responsibility-limits)
3. [Service Layer Patterns](#service-layer-patterns)
4. [Component Organization](#component-organization)
5. [Icon Usage Policy](#icon-usage-policy)
6. [Code Quality Standards](#code-quality-standards)
7. [Testing Requirements](#testing-requirements)
8. [Performance Guidelines](#performance-guidelines)
9. [Enforcement & Compliance](#enforcement--compliance)

---

## 🏗️ **Microservice Architecture Principles**

### **Core Philosophy**
DamDoh follows a **strict microservice architecture** where each component, service, and file has a **single, well-defined responsibility**. This ensures maintainability, testability, and scalability.

### **Key Principles**
- **Single Responsibility Principle (SRP)**: Each file/component/service does ONE thing only
- **Service Composition**: Complex features built by composing smaller services
- **Dependency Injection**: Services composed, not hardcoded
- **SOLID Principles**: Clean architecture patterns throughout
- **Separation of Concerns**: UI, business logic, and data access strictly separated

### **Architecture Layers**
```
DamDoh Application (Microservice Architecture)
├── 🎯 Orchestrator Layer (StakeholderDashboard, MainDashboard)
├── 🔧 Service Layer (FeedService, NotificationService, ApiKeyService, etc.)
├── 🎨 Layout Layer (FarmerLayout, AgriTechLayout, etc.)
├── 🧩 Widget Layer (Individual micro-components)
├── ⚙️ Configuration Layer (stakeholder-configs.ts)
└── 📊 Data Layer (API calls, caching, state management)
```

---

## 📏 **File Size & Single Responsibility Limits**

### **Strict File Size Limits**
| File Type | Max Lines | Rationale |
|-----------|-----------|-----------|
| **Component Files** | **150 lines** | UI components should be focused |
| **Service Files** | **200 lines** | Services should have single responsibility |
| **Widget Files** | **100 lines** | Widgets are micro-components |
| **Layout Files** | **120 lines** | Layouts orchestrate, don't implement |
| **Type Definition Files** | **300 lines** | Types should be domain-specific |

### **Violation Examples (FIXED)**
- ❌ `StakeholderDashboard.tsx` was 1,200+ lines (mixed UI + API + state)
- ❌ `FarmManagementWidgets.tsx` was 814 lines (10 widgets in one file)
- ✅ **Now:** Split into focused, single-responsibility files

### **File Naming Convention**
```
PascalCase for components: FarmerDashboard.tsx
camelCase for services: feedService.ts
kebab-case for utilities: api-utils.ts
```

---

## 🔧 **Service Layer Patterns**

### **Required Service Patterns**
All services MUST implement:

```typescript
export class ExampleService {
  private static instance: ExampleService;

  static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }

  // Business methods only - no UI logic
  async businessMethod(): Promise<Result> {
    // Implementation
  }

  // Caching with TTL
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Error handling with fallbacks
  async methodWithFallback(): Promise<Result> {
    try {
      return await apiCall('/endpoint');
    } catch (error) {
      console.error('Service error:', error);
      return this.getFallbackData();
    }
  }
}
```

### **Service Factory Pattern**
```typescript
export class DashboardServices {
  static get feed(): FeedService { /* lazy init */ }
  static get notifications(): NotificationService { /* lazy init */ }
  static get apiKeys(): ApiKeyService { /* lazy init */ }
  // etc.
}
```

### **Caching Strategy**
- **API responses**: 3-10 minute TTL based on data volatility
- **User preferences**: Session-based caching
- **Static data**: Application lifetime caching

---

## 🎨 **Component Organization**

### **Component Hierarchy**
```
src/components/
├── dashboard/
│   ├── MainDashboard.tsx          # Route-level orchestrator
│   ├── hubs/                      # Stakeholder-specific dashboards
│   │   ├── StakeholderDashboard.tsx # Generic dashboard orchestrator
│   │   ├── FarmerDashboard.tsx    # Farmer-specific customizations
│   │   └── [OtherStakeholder]Dashboard.tsx
│   ├── layouts/                   # Layout orchestrators
│   │   ├── FarmerLayout.tsx       # Farmer widget composition
│   │   └── [Other]Layout.tsx
│   └── widgets/                   # Individual micro-components
│       ├── index.ts               # Centralized exports
│       ├── DailyOperationsWidget.tsx
│       └── [WidgetName].tsx
```

### **Component Responsibilities**
- **MainDashboard**: Route handling, user role detection, config selection
- **StakeholderDashboard**: Generic dashboard with conditional rendering
- **Individual Dashboards**: Stakeholder-specific customizations only
- **Layouts**: Widget composition and orchestration
- **Widgets**: Single-purpose UI micro-components

### **Import Strategy**
```typescript
// ✅ Correct: Centralized imports
import {
  DailyOperationsWidget,
  FarmResourcesWidget,
  EmergencyAlertsWidget
} from '@/components/dashboard/widgets';

// ❌ Wrong: Direct file imports
import DailyOperationsWidget from './widgets/DailyOperationsWidget';
```

---

## 🎯 **Icon Usage Policy**

### **MANDATORY: Lucide React Icons Only**

**All icons in the DamDoh system MUST use Lucide React icons exclusively.**

```typescript
// ✅ Correct: Lucide React icons only
import {
  Home, Search, Users, MessageCircle, Bell,
  Tractor, Sprout, DollarSign, Settings
} from 'lucide-react';

// ❌ Forbidden: Any other icon libraries
import { FaHome } from 'react-icons/fa';        // FontAwesome
import { AiOutlineHome } from 'react-icons/ai'; // Ant Design
import HomeIcon from '@mui/icons-material/Home'; // Material UI
```

### **Icon Usage Guidelines**
- **Consistent Sizing**: Use standard sizes (h-4 w-4, h-5 w-5, h-6 w-6)
- **Semantic Naming**: Choose icons that clearly represent their function
- **Accessibility**: Icons should have appropriate aria-labels when used standalone
- **Color Consistency**: Use theme colors, not hardcoded colors

### **Approved Icon Categories**
- **Navigation**: Home, Search, Users, Settings
- **Agriculture**: Tractor, Sprout, Leaf, CloudRain
- **Commerce**: ShoppingCart, DollarSign, Package
- **Communication**: MessageCircle, Bell, Mail
- **Actions**: Plus, Edit, Trash2, CheckCircle

---

## 🧹 **Code Quality Standards**

### **TypeScript Strict Mode**
- **Strict null checks**: `strictNullChecks: true`
- **No implicit any**: `noImplicitAny: true`
- **Strict property initialization**: `strictPropertyInitialization: true`

### **Error Handling**
```typescript
// ✅ Required pattern
try {
  const result = await apiCall('/endpoint');
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  // Provide fallback or rethrow with context
  throw new Error(`Operation failed: ${error.message}`);
}
```

### **Performance Standards**
- **Bundle size**: Monitor and optimize
- **Lazy loading**: Components loaded on demand
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Virtual scrolling**: For large lists

---

## 🧪 **Testing Requirements**

### **Testing Coverage**
- **Unit Tests**: 80%+ coverage for services and utilities
- **Component Tests**: 70%+ coverage for UI components
- **Integration Tests**: Critical user flows

### **Testing Patterns**
```typescript
// Service testing
describe('FeedService', () => {
  it('should fetch feed with caching', async () => {
    // Test implementation
  });
});

// Component testing
describe('DailyOperationsWidget', () => {
  it('should render operation buttons', () => {
    // Test implementation
  });
});
```

---

## ⚡ **Performance Guidelines**

### **Loading States**
- **Skeleton screens**: For initial loads
- **Progressive loading**: Content appears as it loads
- **Error boundaries**: Graceful failure handling

### **Caching Strategy**
- **API responses**: Intelligent TTL-based caching
- **Static assets**: Aggressive caching
- **User data**: Session-based caching

### **Bundle Optimization**
- **Code splitting**: Route-based and component-based
- **Tree shaking**: Remove unused code
- **Compression**: Gzip/Brotli enabled

---

## 🔒 **Enforcement & Compliance**

### **Code Review Requirements**
**ALL pull requests MUST be reviewed for:**
- [ ] File size limits respected
- [ ] Single responsibility principle followed
- [ ] Service layer patterns implemented
- [ ] Lucide React icons used exclusively
- [ ] TypeScript strict mode compliance
- [ ] Tests included and passing
- [ ] Performance guidelines followed

### **Automated Checks**
- **ESLint rules**: Custom rules for DamDoh patterns
- **Pre-commit hooks**: Automated linting and testing
- **CI/CD pipeline**: Automated quality gates

### **Violation Consequences**
- **First offense**: Code review rejection with guidance
- **Repeated offenses**: Escalation to technical lead
- **Pattern violations**: Architecture review required

### **Documentation Requirements**
- **README updates**: For new services/components
- **API documentation**: For service interfaces
- **Migration guides**: For breaking changes

---

## 📚 **Resources & References**

### **Key Files**
- `docs/DEVELOPMENT_POLICY.md` - This policy document
- `src/services/dashboard/index.ts` - Service factory pattern
- `src/components/dashboard/widgets/index.ts` - Widget exports
- `src/lib/stakeholder-configs.ts` - Configuration patterns

### **Examples**
- `src/components/dashboard/hubs/StakeholderDashboard.tsx` - Orchestrator pattern
- `src/services/dashboard/FeedService.ts` - Service implementation
- `src/components/dashboard/widgets/DailyOperationsWidget.tsx` - Widget pattern

### **Tools & Scripts**
- ESLint configuration for DamDoh patterns
- Pre-commit hooks for quality gates
- Bundle analyzer for performance monitoring

---

## 🎯 **Commitment to Excellence**

**This policy ensures DamDoh remains:**
- **Maintainable**: Clean, focused code that's easy to understand
- **Scalable**: Microservice architecture supports rapid growth
- **Reliable**: Comprehensive testing and error handling
- **Performant**: Optimized loading and caching strategies
- **Consistent**: Unified patterns across the entire codebase

**Violations of this policy will not be tolerated.** All developers must adhere to these standards to maintain code quality and architectural integrity.

**Last Updated:** January 2025
**Version:** 1.0
**Enforced By:** Kilo Code AI Assistant