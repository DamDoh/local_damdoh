# DamDoh Quick Reference Guide

## 🚀 **Getting Started**
1. Read `docs/DEVELOPMENT_POLICY.md` - Complete development policy
2. Follow microservice architecture principles
3. Use only Lucide React icons

## 📏 **File Size Limits**
| Type | Max Lines | Example |
|------|-----------|---------|
| Components | 150 | `FarmerDashboard.tsx` |
| Services | 200 | `FeedService.ts` |
| Widgets | 100 | `DailyOperationsWidget.tsx` |
| Layouts | 120 | `FarmerLayout.tsx` |

## 🏗️ **Architecture Pattern**
```typescript
// Service Implementation
export class ExampleService {
  private static instance: ExampleService;

  static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }

  async businessMethod(): Promise<Result> {
    try {
      return await apiCall('/endpoint');
    } catch (error) {
      console.error('Error:', error);
      return fallback;
    }
  }
}

// Component Structure
const ExampleWidget: React.FC = () => {
  // Single responsibility only
  return <div>Widget content</div>;
};
```

## 🎯 **Icon Usage**
```typescript
// ✅ ONLY Lucide React icons allowed
import { Home, Search, Tractor, Sprout } from 'lucide-react';

// ❌ Forbidden - any other icon libraries
// import { FaHome } from 'react-icons/fa';
// import HomeIcon from '@mui/icons-material/Home';
```

## 📁 **File Organization**
```
src/
├── components/dashboard/
│   ├── MainDashboard.tsx          # Route orchestrator
│   ├── hubs/StakeholderDashboard.tsx # Generic dashboard
│   ├── layouts/FarmerLayout.tsx   # Widget composition
│   └── widgets/                   # Individual widgets
├── services/dashboard/            # Business logic services
├── lib/stakeholder-configs.ts     # Configuration
└── types.ts                       # Type definitions
```

## 🔧 **Service Usage**
```typescript
// Import services
import { DashboardServices } from '@/services/dashboard';

// Use services
const feedData = await DashboardServices.feed.fetchFeed();
const apiKeys = await DashboardServices.apiKeys.fetchApiKeys();
```

## ✅ **Code Review Checklist**
- [ ] File size within limits
- [ ] Single responsibility principle
- [ ] Lucide React icons only
- [ ] Service layer patterns followed
- [ ] Error handling implemented
- [ ] Tests included
- [ ] TypeScript strict mode

## 🚨 **Common Violations**
- ❌ Large monolithic components
- ❌ Mixed UI + business logic
- ❌ Non-Lucide icons
- ❌ Direct API calls in components
- ❌ Missing error handling
- ❌ No service layer abstraction

## 📞 **Need Help?**
- Check `docs/DEVELOPMENT_POLICY.md` for detailed guidelines
- Review existing service/component implementations
- Ask for code review before merging

## 🎯 **Remember**
**Quality over speed. Architecture over features. Standards over shortcuts.**

*Enforced by Kilo Code AI Assistant*