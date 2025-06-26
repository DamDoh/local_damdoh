# DamDoh Architecture - High-Level Overview

This document provides a high-level visual overview of the DamDoh microservices architecture. For a comprehensive breakdown of each service, data schemas, and technical strategy, please refer to the master architecture document: **[DamDoh Social Agriculture Platform - Foundational Architecture](./damdoh_architecture.md)**.

## Objective

To design a scalable and modular microservices architecture for the DamDoh super app, capable of supporting billions of users and 21 diverse agricultural stakeholders globally, prioritizing scalability, AI integration, real-time communication, data security, and user experience.

## Architectural Diagram

```mermaid
graph LR
    subgraph Frontend
        MobileApp[Mobile App (e.g., Next.js PWA)]
    end

    subgraph "API Gateway (Cloud Functions)"
        APIGateway(API Gateway)
    end

    subgraph "Core Microservices (Cloud Functions / Cloud Run)"
        UserMgmt("User Management")
        FarmMgmt("Farm & Asset Service")
        SocialFeed("Social Feed & Community")
        Marketplace("Marketplace Service")
        AIService("AI & Analytics Service")
        CommService("Communication Service")
        FinanceService("Financial & Transaction Service")
        Traceability("Traceability Service")
        KnowledgeHub("Information & Knowledge Hub")
        Regulatory("Regulatory & Compliance")
        Insurance("Insurance Service")
        Sustainability("Sustainability & Impact")
    end

    MobileApp --> APIGateway

    APIGateway --> UserMgmt
    APIGateway --> FarmMgmt
    APIGateway --> SocialFeed
    APIGateway --> Marketplace
    APIGateway --> AIService
    APIGateway --> CommService
    APIGateway --> FinanceService
    APIGateway --> Traceability
    APIGateway --> KnowledgeHub
    APIGateway --> Regulatory
    APIGateway --> Insurance
    APIGateway --> Sustainability

    UserMgmt <--> FarmMgmt
    UserMgmt <--> SocialFeed
    UserMgmt <--> Marketplace
    UserMgmt <--> FinanceService

    Marketplace <--> FinanceService
    Marketplace <--> Traceability
    Marketplace <--> AIService

    FarmMgmt <--> Traceability
    FarmMgmt <--> AIService
    FarmMgmt <--> Sustainability

    SocialFeed <--> AIService
    SocialFeed <--> KnowledgeHub

    Traceability <--> Sustainability
    Traceability <--> Regulatory
    Traceability <--> AIService

    FinanceService <--> Insurance
    FinanceService <--> AIService

    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef frontend fill:#e0f2fe,stroke:#0284c7;
    classDef gateway fill:#ede9fe,stroke:#6d28d9;

    class MobileApp frontend;
    class APIGateway gateway;

```
This diagram illustrates the separation of concerns and the central role of the API Gateway in orchestrating communication between the frontend and the various backend microservices. Each service is designed to be independently scalable and maintainable.