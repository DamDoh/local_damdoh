
// damdoh-app/firebase/functions/src/lib/stakeholder-data.ts
export const stakeholderData = `
# The 24 Stakeholders of the DamDoh Ecosystem

This data outlines the roles and core interactions for each stakeholder in the DamDoh ecosystem.

---
### 1. Farmer
*   **Role:** The primary producer of agricultural goods. They cultivate crops, raise livestock, and are the originators of agricultural products.
*   **Core Interactions:** Registers on the app, manages farm profile, logs farming activities (planting, inputs, harvest) which creates VTIs. Receives AI-driven agronomy advice, market insights, and connects with suppliers, buyers, and financial institutions via the platform.

---
### 2. Agricultural Cooperative
*   **Role:** Represents a group of farmers, facilitating collective bargaining, input procurement, and market access.
*   **Core Interactions:** Aggregates VTI-linked produce from members, manages member profiles, and negotiates bulk sales on the marketplace.

---
### 3. Field Agent/Agronomist (DamDoh Internal)
*   **Role:** DamDoh's on-the-ground support, assisting farmers with app adoption, data entry, and bridging the digital divide.
*   **Core Interactions:** Helps farmers create profiles, log activities, generate VTIs, and provides feedback to improve AI models.

---
### 4. Operations/Logistics Team (DamDoh Internal)
*   **Role:** Manages the internal logistical flow of data, ensuring system uptime and data integrity.
*   **Core Interactions:** Monitors all platform modules, especially VTI creation, marketplace activity, and financial transactions.

---
### 5. Quality Assurance Team (DamDoh Internal)
*   **Role:** Ensures the accuracy and integrity of VTI-linked information and other platform data.
*   **Core Interactions:** Audits VTI data, farm logs, and marketplace listings, often using AI for anomaly detection.

---
### 6. Processing & Packaging Unit
*   **Role:** Transforms raw agricultural produce into processed goods (e.g., flour from grain, roasted coffee from beans).
*   **Core Interactions:** Receives VTI-linked raw produce and creates new, linked VTIs for the processed products.

---
### 7. Buyer (Restaurant, Supermarket, Exporter)
*   **Role:** Purchases agricultural products for further sale or export. They are key demand drivers.
*   **Core Interactions:** Uses the marketplace to source VTI-linked products, tracks deliveries, and manages payments.

---
### 8. Input Supplier (Seed, Fertilizer, Pesticide)
*   **Role:** Provides essential agricultural inputs to farmers.
*   **Core Interactions:** Lists products on the marketplace, which can have their own VTIs that farmers link to their crop batches.

---
### 9. Equipment Supplier (Sales of Machinery/IoT)
*   **Role:** Provides agricultural machinery, tools, and IoT devices.
*   **Core Interactions:** Lists equipment on the marketplace. IoT devices can feed data directly into the platform for precision agriculture.

---
### 10. Financial Institution (Micro-finance/Loans)
*   **Role:** Provides financial services like loans and credit.
*   **Core Interactions:** Integrates with the financial services module, using AI-generated credit scores based on platform data for lending decisions.

---
### 11. Government Regulator/Auditor
*   **Role:** Sets and enforces agricultural policies and food safety standards.
*   **Core Interactions:** Accesses verifiable, VTI-linked data for regulatory oversight and audits.

---
### 12. Certification Body (Organic, Fair Trade etc.)
*   **Role:** Certifies agricultural products and practices against specific standards.
*   **Core Interactions:** Uses VTI-linked farm data and traceability logs to streamline certification audits.

---
### 13. Consumer
*   **Role:** The end-user of agricultural products who demands transparency.
*   **Core Interactions:** Scans VTI on products to trace their origin, history, and sustainability impact.

---
### 14. Researcher/Academic
*   **Role:** Conducts research on agriculture, sustainability, and market dynamics.
*   **Core Interactions:** Accesses anonymized and aggregated VTI-linked data for scientific research.

---
### 15. Logistics Partner (Third-Party Transporter)
*   **Role:** Provides transportation services for agricultural products.
*   **Core Interactions:** Integrates with the platform to receive transport requests and update shipment status linked to VTI events.

---
### 16. Storage/Warehouse Facility
*   **Role:** Provides storage and warehousing services.
*   **Core Interactions:** Logs receipt and dispatch of VTI-linked products, creating traceability events.

---
### 17. Agronomy Expert/Consultant (External)
*   **Role:** Provides specialized, often paid, advisory services.
*   **Core Interactions:** Offers services on the marketplace and can access VTI-linked farm data (with consent) for analysis.

---
### 18. Agro-Tourism Operator
*   **Role:** Promotes and facilitates tourism experiences related to agriculture.
*   **Core Interactions:** Lists agro-tourism experiences on the marketplace and uses community features for promotion.

---
### 19. Energy Solutions Provider (Solar, Biogas)
*   **Role:** Offers renewable energy solutions to farms and processing units.
*   **Core Interactions:** Lists energy solutions on the marketplace; their adoption contributes to sustainability metrics.

---
### 20. Agro-Export Facilitator/Customs Broker
*   **Role:** Assists with export procedures and international trade regulations.
*   **Core Interactions:** Leverages VTI-linked traceability data and compliance reports to streamline export documentation.

---
### 21. Agri-Tech Innovator/Developer
*   **Role:** Develops new technologies, software, or hardware for agriculture.
*   **Core Interactions:** Uses the platform's API gateway to integrate their solutions and services.

---
### 22. Waste Management & Compost Facility
*   **Role:** Processes agricultural waste into valuable resources, promoting a circular economy.
*   **Core Interactions:** Logs receipt of waste and tracks production of new resources like compost, which can have its own VTI.

---
### 23. Crowdfunder (Impact Investor, Individual)
*   **Role:** Provides alternative financing or grants to agricultural projects.
*   **Core Interactions:** Discovers projects and tracks the impact of their investment via VTI-linked data.

---
### 24. Insurance Provider
*   **Role:** Offers agricultural insurance products to mitigate risks.
*   **Core Interactions:** Integrates to offer policies, using VTI-linked data for risk assessment and automated claim triggers.
`;

    