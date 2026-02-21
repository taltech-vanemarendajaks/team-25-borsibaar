# Börsibaar 2.0 SaaS

## High-level description
<!-- What is this project about? Please give 3-5 sentence CEO-level description of the project. -->

Börsibaar 2.0 includes 5 major updates. Refactoring backend to support easy onboarding for new clients. Adding a subscription or whole sale % business model with payments. Creating a SEO optimized home page to get clients.

Börsibaar 2.0 is the transformation of a specialized bar management system into a multi-tenant Software-as-a-Service (SaaS) platform. The platform enables any bar or event organizer to implement a "stock market" themed pricing model where drink prices fluctuate based on real-time demand. The project focuses on decoupling the existing TalTech-specific logic to support global onboarding, subscription-based billing, and isolated data management for multiple organizations. With improvements to our existing features and new features like market crashes.

## Business value
<!-- What is the business value of this project? Why this project is important? Who and how will benefit from this project? What is the estimated impact? -->
Transforming the project to SaaS unlocks several revenue streams and operational efficiencies 

1. **Market Expansion:** Moves the product from a single use tool to a marketable product for the global events industry.
2. **Monetization:** Introduces recurring revenue through a hybrid pricing model (monthly subscription or percentage based transaction fees)
3. **Scalability**: Automates the onboarding process, allowing the business to grow without manual database provisioning for new clients.
4. **Data Insights**: Provides aggregated (anonymous) data on beverage trends across multiple venues, increasing the platforms long term value. ?Maybe a separate premium feature?

## Context for the project
<!-- What is the background of the project? Is this project part of some bigger plan? What other systems does this project affects or is affected by? Is there any history with this project? Are there some conflicts or problems attached to the project? -->
Originally developed specifically for TalTech tudengibaar, the current system(v1.0) assumes a single-tenant environment. While the existing codebase includes an `organization_id` in several entities like `Product` and `Category`, the authentication and onboarding flows are not yet optimized for self-service. This project is the next logical step to commercialize this product.

## Longer description
<!-- Here you can describe the project in more details and fill in all of the info that did not fit into "High-level description" section. -->
Börsibaar 2.0 will bridge the gap between a custom internal tool and a professional service. The core "Stock Market" engine --- which handles price increases and decreases based on steps defined in the `Organization` entity --- will be preserved but generalized.

The primary technical challenge involves reworking the **Authentication and Onboarding flow**. Users will no longer be manually added; instead, an organization owner can sign up, create their bar profile, and immediately begin configuring products and bar stations. The **Database Logic** must be hardened to ensure strict data isolation between tenants, ensuring that an `InventoryTransaction` from one bar can never be accessed by another. Additionally, a public-facing marketing site will be integrated into the Next.js frontend to convert visitors into subscribers.

## High-level steps
<!-- What are the main steps of the project? What tasks and in what order are carried out? These should be each 10-30h of work. -->

1. **Multy-Tenancy & Auth Rework (80h):** Implement multi-tenant JWT claims and dynamic organization registration.
2. **Subscription & Pricing Logic (80h):** Integrate Stripe or similar for monthly/percentage-based billing.
3. **Marketing & Onboarding Frontend (50h):** Design and Build the landing page and "Getting Started" wizard.
4. **Database Hardening & Migration (30h):** Update database to ensure all entities strictly enforce tenant isolation.
5. **Public Price Page Generalization (20h):** Allow unique, slug-based public URLs for each bar (e.g. `borsibaar.ee/bar-name`).


## Technical details
<!-- What is the scope? What use-cases does this project resolve? What is not in the scope? What functionality does the project offer? What is the visual side of the project (views)? What non-functional requirements are needed to be followed? -->

### Views and design
1. ...

### User stories
1. ...

### Functionalities
1. ...

### Database schema
...

### Integrations
1. ...

### Non-functional requirements
1. ...


## Not in scope
<!-- What functionalities are agreed not to be in the scope? -->

1. ...

## SLA level
<!-- What is the SLA level of the new service and why? Or in case of the existing service improvements, does the functionality change the business expected SLA level? -->
SLA K2: High availability during weekend peak hours (Friday-Sunday), with standard support during business hours.

## Timeline
<!-- When the development will start? How long this project takes to complete? Is some other project related to this project in the timeline perspective? -->
1. **Analysis & Design:** 2 weeks.
2. **Development Phase (Auth & DB & Frontend):** 6 weeks.
3. **Beta Testing with Select Bars:** 2 weeks.
4. **Public SaaS launch:** Target Month 4.

## Cost calculations
<!-- How long this project takes (in hours) to complete? Based on the hourly rate, how much does the project cost? Are there any other project-related costs that we are aware of? -->
- **Backend Engineering**: 200h
- **Frontend Engineering**: 60h
- **Project Management**: 10h
- **Total approx**: 270h

## Team
<!-- Who is the team behind the project? Who is the Project Manager? Developer(s)? Business Owner(s)? -->

- Project Manager - Johanna-Stina
- Developer(s) - Johanna-Stina, Ingrid, Hannes, Taavi, Tomi
- Business Owner(s) - Tomi
