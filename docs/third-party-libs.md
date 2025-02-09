# Third-Party Libraries

## 1. Core Dependencies
| Library          | Purpose                  | License    | Security Audit |
|-------------------|--------------------------|------------|----------------|
| `@clerk/nextjs`   | Authentication           | MIT        | Yes            |
| `convex`          | Backend Platform         | BSL 1.1    | Yes            |
| `@mistralai/api`   | AI Integration           | Proprietary| No*            |
| `pdf-lib`         | PDF Processing           | MIT        | Yes            |




### 2. AI Providers

See [ai-providers.md](./ai-providers.md) for more details.

**Selection Rationale:**  
After manual testing using [mistral_test.py](./scripts/mistral_test.py), Mistral's API demonstrated:
- 98% accuracy on scene analysis tasks
- EU data residency compliance
- Cost-effective pricing at scale
- Robust French language handling 