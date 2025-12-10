# Enterprise Secure Notes - Architecture Diagrams

## Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web App<br/>React PWA]
        B[Mobile App<br/>React Native]
        C[Desktop App<br/>Electron]
    end

    subgraph "CDN & Load Balancing"
        D[CloudFlare CDN]
        E[Load Balancer<br/>AWS ALB]
    end

    subgraph "API Gateway Layer"
        F[API Gateway<br/>Kong/Envoy]
        G[Rate Limiter]
        H[WAF Protection]
        I[Auth Middleware]
    end

    subgraph "Microservices Layer"
        J[Auth Service<br/>Node.js]
        K[Notes Service<br/>Node.js]
        L[Billing Service<br/>Node.js]
        M[Admin Service<br/>Node.js]
        N[Search Service<br/>Node.js]
    end

    subgraph "Data Layer"
        O[(PostgreSQL<br/>Multi-tenant)]
        P[(Redis Cluster<br/>Cache/Sessions)]
        Q[(Elasticsearch<br/>Search Index)]
        R[(S3 Storage<br/>File Storage)]
    end

    subgraph "External Services"
        S[Stripe API]
        T[Auth0/Okta]
        U[SendGrid]
        V[Monitoring<br/>Datadog]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N

    J --> O
    J --> P
    K --> O
    K --> P
    L --> O
    L --> P
    L --> S
    M --> O
    N --> Q
    K --> R

    J --> T
    K --> U
    L --> U
    M --> V
    N --> V
```

## Multi-Tenant Database Architecture

```mermaid
graph TD
    subgraph "Tenant Isolation Strategies"
        A[Database per Tenant<br/>Maximum Security]
        B[Schema per Tenant<br/>Balanced Approach]
        C[Shared Schema<br/>Cost Effective]
    end

    subgraph "Database Layer"
        D[(PostgreSQL Primary)]
        E[(Read Replica 1)]
        F[(Read Replica 2)]
        G[(Backup Database)]
    end

    subgraph "Tenant Data"
        H[Tenant A<br/>Database]
        I[Tenant B<br/>Database]
        J[Tenant C<br/>Database]
        K[Tenant N<br/>Database]
    end

    subgraph "Shared Services"
        L[User Management]
        M[Billing & Subscriptions]
        N[System Configuration]
        O[Audit Logs]
    end

    A --> H
    A --> I
    A --> J
    A --> K

    D --> E
    D --> F
    D --> G
    H --> D
    I --> D
    J --> D
    K --> D

    L --> D
    M --> D
    N --> D
    O --> D
```

## Security Architecture

```mermaid
graph LR
    subgraph "Client Security"
        A[Browser]
        B[Local Encryption<br/>AES-GCM]
        C[Key Derivation<br/>PBKDF2/Argon2]
        D[Offline Storage<br/>IndexedDB]
    end

    subgraph "Network Security"
        E[HTTPS/TLS 1.3]
        F[WAF Protection]
        G[API Gateway]
    end

    subgraph "Application Security"
        H[JWT with Rotation]
        I[Multi-Factor Auth]
        J[Session Management]
        K[RBAC Authorization]
    end

    subgraph "Data Security"
        L[Database Encryption<br/>at Rest]
        M[Encrypted Backups]
        N[Key Management<br/>HSM]
        O[Audit Logging]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as Auth Service
    participant E as External IdP
    participant D as Database
    participant R as Redis

    Note over U,D: Traditional Login Flow
    U->>W: Login Request
    W->>A: Authenticate
    A->>D: Verify Credentials
    D-->>A: User Data
    A->>R: Store Session
    A-->>W: JWT Token
    W-->>U: Login Success

    Note over U,D: SSO Login Flow
    U->>W: SSO Login
    W->>A: Initiate SSO
    A->>E: Redirect to IdP
    E-->>U: Login Form
    U->>E: Submit Credentials
    E->>A: SAML/OIDC Response
    A->>D: Create/Update User
    A->>R: Store Session
    A-->>W: JWT Token
    W-->>U: Login Success
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        A[Local Development]
        B[Feature Branches]
        C[Integration Tests]
    end

    subgraph "CI/CD Pipeline"
        D[GitHub Actions]
        E[Security Scans]
        F[Build & Test]
        G[Deploy to Staging]
    end

    subgraph "Staging Environment"
        H[Load Testing]
        I[Security Testing]
        J[User Acceptance Testing]
    end

    subgraph "Production Environment"
        K[US-East-1 Primary]
        L[EU-West-1 Secondary]
        M[Asia-Pacific DR]
    end

    subgraph "Monitoring & Alerting"
        N[Application Monitoring]
        O[Security Monitoring]
        P[Performance Monitoring]
        Q[Business Metrics]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    K --> N
    L --> O
    M --> P
    N --> Q
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Write Operations"
        A[User Creates Note]
        B[Client Encrypts]
        C[Offline Queue]
        D[Sync Service]
        E[API Gateway]
        F[Notes Service]
        G[Database]
    end

    subgraph "Read Operations"
        H[User Requests Notes]
        I[Cache Check]
        J[Database Query]
        K[Decrypt Client-Side]
        L[Return to User]
    end

    subgraph "Search Operations"
        M[Search Query]
        N[Encrypt Search Terms]
        O[Elasticsearch]
        P[Return Encrypted Results]
        Q[Decrypt Client-Side]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G

    H --> I
    I -->|Cache Miss| J
    J --> G
    G --> K
    K --> L

    M --> N
    N --> O
    O --> P
    P --> Q
```

## Subscription & Billing Flow

```mermaid
graph TB
    subgraph "Subscription Management"
        A[User Selects Plan]
        B[Stripe Checkout]
        C[Payment Processing]
        D[Webhook Handler]
        E[Update User Plan]
        F[Apply Plan Limits]
    end

    subgraph "Usage Tracking"
        G[API Request Counter]
        H[Storage Usage Monitor]
        I[Feature Usage Analytics]
        J[Billing Calculation]
    end

    subgraph "Plan Enforcement"
        K[Rate Limiting]
        L[Storage Quotas]
        M[Feature Access Control]
        N[Upgrade Prompts]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    G --> J
    H --> J
    I --> J
    J --> K
    J --> L
    J --> M
    J --> N