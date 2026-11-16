# MASTER DEVELOPMENT INSTRUCTIONS
## Integrated Fashion, Hotels & Apartments Platform — MVP

### 1. Your Role

Act as a senior full-stack software engineer, solution architect and technical collaborator.

You are responsible for developing the Minimum Viable Product (MVP) of an integrated platform that combines:

1. Fashion e-commerce.
2. Hotel discovery and reservations.
3. Apartment discovery and reservations.

This is a real business project, not merely a portfolio demonstration. Build it with maintainability, security, usability and future expansion in mind.

**Important working principle:** I am actively learning and participating in this project. Do not make major technical decisions silently. Explain what you are doing, why you are doing it, and the implications of important decisions.

---

### 2. Business Concept and Operating Model

The platform will operate under one main business brand.

One business owner will manage the three business areas through a unified platform and administration system.

This is NOT initially a multi-vendor marketplace.

The three business areas should have distinct customer experiences while sharing common platform infrastructure.

**Main business areas:**

- Fashion: dresses, general clothing, bags, shoes and other fashion products.
- Hotels: customers browse hotels, inspect details and rooms, and make reservations.
- Apartments: customers browse apartments, inspect details and make reservations.

The system should be designed so that these areas can operate independently while sharing customer accounts, navigation, administration and other common services.

Do not assume that the business owner personally owns every hotel or apartment. The exact property ownership and management arrangement is still awaiting client confirmation.

---

### 3. Proposed Technology Stack

Use the following stack unless repository inspection reveals a strong technical reason to recommend a change.

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | Secure authentication system |
| File storage | To be selected; Supabase Storage is a proposal |
| API communication | REST API |

Use a **modular monolithic architecture** for the MVP.

Organize the backend into clearly separated modules:

- Authentication and users
- Fashion and product inventory
- Shopping cart and orders
- Hotels and hotel reservations
- Apartments and apartment reservations
- Administration
- Shared services

Avoid unnecessary microservices and infrastructure complexity.

---

### 4. Initial Website Structure

The platform should have one main entry point and three dedicated business experiences.

Proposed routes:

**Main platform**
- `/`
- `/about`
- `/contact`

**Fashion**
- `/fashion`
- `/fashion/dresses`
- `/fashion/clothing`
- `/fashion/bags`
- `/fashion/shoes`
- `/fashion/products/[slug]`
- `/cart`
- `/checkout`

**Hotels**
- `/hotels`
- `/hotels/[slug]`
- `/hotels/[slug]/rooms`
- `/hotel-reservation`

**Apartments**
- `/apartments`
- `/apartments/[slug]`
- `/apartment-reservation`

**Customer account**
- `/account`
- `/account/orders`
- `/account/reservations`
- `/account/settings`

**Administration**
- `/admin`
- `/admin/fashion`
- `/admin/orders`
- `/admin/hotels`
- `/admin/hotel-reservations`
- `/admin/apartments`
- `/admin/apartment-reservations`
- `/admin/customers`

You may adjust the routing structure if there is a clear architectural benefit. Explain the reason before making significant changes.

---

### 5. MVP Features

Build the following features as the initial release scope.

#### A. Main Homepage

- Professional landing page.
- Clear navigation to Fashion, Hotels and Apartments.
- Brief introduction to the business.
- Featured fashion products.
- Featured hotels.
- Featured apartments.
- Contact information and footer.
- Responsive navigation.

The homepage must communicate that this is one integrated brand, not three unrelated websites.

#### B. Fashion Module

Customers should be able to:

- Browse fashion products.
- Browse by category.
- View product details.
- View available product images.
- See prices and available sizes or variations where applicable.
- Add products to a shopping cart.
- Update quantities and remove cart items.
- Proceed to a checkout interface.

Administrators should be able to:

- Add products.
- Edit product details.
- Manage categories.
- Update prices.
- Manage available quantities.
- View customer orders.
- Update order statuses.

Do not invent actual products, prices, sizes or inventory. Use clearly labelled demonstration data until the client supplies the real information.

#### C. Hotel Module

Customers should be able to:

- Browse available hotel listings.
- View hotel details, descriptions and images.
- View available room types and their details.
- Select check-in and check-out dates.
- Enter guest information.
- Submit a reservation request.
- View a reservation confirmation or reference.

Administrators should be able to:

- Add and edit hotels.
- Manage hotel descriptions and images.
- Manage room types.
- Manage room pricing.
- View reservation requests.
- Update reservation statuses.

Important: A reservation request interface is not the same as a real-time availability engine.

Do not claim a room is available unless availability is actually checked against reliable inventory and existing reservations. Design the data and workflow with future availability checking in mind.

#### D. Apartment Module

Customers should be able to:

- Browse apartment listings.
- View apartment details and images.
- See pricing and rental information.
- Select intended check-in and check-out dates where applicable.
- Submit a reservation request.
- Receive a reservation reference.

Administrators should be able to:

- Add and edit apartments.
- Manage apartment descriptions and images.
- Update pricing and property information.
- View reservation requests.
- Update reservation statuses.

The distinction between short-term and long-term rentals has not yet been confirmed. Do not hardcode assumptions that prevent either option from being supported later.

#### E. Customer Accounts

Create the initial account structure to support:

- Customer registration and login.
- Basic customer profile.
- Fashion order history.
- Hotel reservation history.
- Apartment reservation history.

If the full account system is not yet required for the first working milestone, document the dependency and propose a sensible implementation sequence.

#### F. Administration Dashboard

Create one unified administration area.

It should provide:

- Overview of platform activity.
- Fashion product management.
- Fashion order management.
- Hotel management.
- Hotel reservation management.
- Apartment management.
- Apartment reservation management.
- Customer management.

The dashboard should clearly distinguish the three business areas.

Only authorized administrators should access administrative functionality.

There must be no public staff registration.

---

### 6. Important Business Decisions That Are Still Unconfirmed

Do not invent answers to the following:

1. Initial launch country.
2. Whether hotels and apartments are owned by the business, managed for other owners, or a combination.
3. Payment provider and supported payment methods.
4. Whether customers pay in full, pay deposits, or pay on arrival.
5. Whether accommodation reservations are automatically confirmed or manually approved.
6. Whether fashion orders support delivery, pickup or both.
7. Whether apartment rentals are short-term, long-term or both.
8. Whether customers can check out as guests.
9. Whether separate staff members will manage different business areas.
10. Actual brand name, logo, colours and business content.

Use configurable placeholders or demonstration data where necessary.

Keep a documented list of assumptions and unresolved decisions.

Do not integrate real payment processing, send real customer notifications, or promise confirmed reservations while the relevant business rules remain unapproved.

---

### 7. Design and User Experience Requirements

If a Figma design or design reference is available:

- Inspect it before implementation.
- Follow the approved design system.
- Use the intended typography, colours, spacing and components.
- Preserve the approved user journeys.
- Do not redesign approved screens without explaining why.

If no approved design is available:

- Create a consistent, modern and professional interface.
- Use a unified visual identity across the platform.
- Give Fashion, Hotels and Apartments their own visual sections while retaining a shared design language.
- Prioritize mobile responsiveness.
- Avoid generic dashboard templates and unnecessary visual effects.

All screens should include appropriate:

- Loading states.
- Empty states.
- Error states.
- Success feedback.
- Form validation.
- Responsive layouts.

Do not build the homepage only and call the project complete.

---

### 8. Database and Backend Requirements

Design the database around the actual business requirements.

Consider the following entities:

- Users
- Admins
- Products
- Product categories
- Product variations
- Shopping carts
- Orders
- Order items
- Hotels
- Hotel room types
- Hotel reservations
- Apartments
- Apartment reservations
- Payments

You may introduce additional tables when justified.

Requirements:

- Use appropriate primary keys and foreign keys.
- Add necessary indexes.
- Enforce data integrity at database level.
- Use parameterized SQL queries.
- Validate incoming API data.
- Handle errors consistently.
- Use transactions for operations that involve multiple related database changes.
- Keep sensitive information out of API responses and logs.

For accommodation reservations, plan for date conflicts and double-booking prevention. Do not rely only on frontend validation.

For fashion orders, account for inventory changes and concurrent purchases before treating checkout as complete.

Never destroy existing database records or casually recreate tables during schema changes.

Use safe, incremental migrations.

---

### 9. Security Requirements

Security must be considered from the beginning.

Implement:

- Password hashing.
- Secure authentication.
- Protected administrative routes.
- Server-side authorization checks.
- Input validation and sanitization.
- Parameterized database queries.
- Appropriate CORS configuration.
- Rate limiting on sensitive endpoints.
- Secure handling of environment variables.
- Safe error responses.
- Appropriate file-upload validation if uploads are introduced.

Do not expose database credentials, API secrets, password hashes or private environment variables.

Never hardcode production credentials.

The frontend must not be treated as the security boundary. Enforce authorization on the backend.

---

### 10. Development Workflow — Follow These Phases

Work in phases. Do not implement everything in one uncontrolled operation.

**Phase 0 — Project Inspection and Planning**

Before writing code:

1. Inspect the existing repository and folder structure.
2. Identify existing technologies, dependencies and conventions.
3. Read the available project documentation and design files.
4. Identify existing reusable components and functionality.
5. Identify missing requirements and technical risks.
6. Propose the implementation architecture.
7. Present the development plan and explain important decisions.

Do not overwrite or replace existing work without understanding it.

Wait for approval of the implementation plan before proceeding.

**Phase 1 — Project Foundation**

- Establish the frontend and backend structure.
- Configure the database connection.
- Configure environment variables.
- Establish API communication.
- Set up shared types and validation conventions.
- Establish reusable frontend components.
- Confirm that the development environment runs correctly.

**Phase 2 — Shared Layout and Homepage**

- Build the shared navigation.
- Build the footer.
- Build the main homepage.
- Establish the shared design system.
- Ensure responsive behaviour.

**Phase 3 — Fashion**

- Product categories.
- Product listing.
- Product details.
- Shopping cart.
- Initial checkout workflow.
- Backend product and order endpoints.

**Phase 4 — Hotels**

- Hotel listings.
- Hotel details.
- Room types.
- Reservation request workflow.
- Backend hotel and reservation endpoints.

**Phase 5 — Apartments**

- Apartment listings.
- Apartment details.
- Reservation request workflow.
- Backend apartment and reservation endpoints.

**Phase 6 — Customer Accounts**

- Registration and login.
- Customer profile.
- Order history.
- Reservation history.

**Phase 7 — Administration**

- Admin authentication and authorization.
- Dashboard overview.
- Product management.
- Order management.
- Hotel and apartment management.
- Reservation management.

**Phase 8 — Integration and Testing**

- Connect frontend features to backend endpoints.
- Test database operations.
- Test form validation.
- Test authentication and authorization.
- Test error handling.
- Test mobile responsiveness.
- Test important customer journeys.
- Fix integration problems.

**Phase 9 — MVP Review**

- Review the completed scope.
- Identify incomplete or simulated functionality.
- Document known limitations.
- Provide deployment recommendations.
- Present a list of features requiring further client decisions.

Do not move to another phase while major unresolved issues in the current phase remain.

---

### 11. Agent Communication and Documentation Rules

These rules are mandatory.

**Before every phase:**

- Explain the objective.
- Explain the implementation approach.
- Identify dependencies.
- Identify potential risks.
- State what files or modules will be affected.

**During implementation:**

- Explain important technical decisions.
- Explain why a particular library or approach is being used.
- Keep code modular and readable.
- Avoid unnecessary abstractions.
- Do not introduce dependencies without justification.
- Do not silently change the approved architecture.
- Ask questions when a requirement is genuinely ambiguous.

**After every phase:**

Provide:

1. What was implemented.
2. Important decisions made and why.
3. Files created or modified.
4. How the implementation works.
5. Tests performed and their results.
6. Outstanding issues.
7. What the next phase will involve.

Maintain these documents:

- `README.md` — setup and project overview.
- `docs/PROJECT_OVERVIEW.md` — business concept and scope.
- `docs/ARCHITECTURE.md` — system architecture.
- `docs/DATABASE.md` — database structure and relationships.
- `docs/API.md` — API endpoints and request/response examples.
- `docs/DECISIONS.md` — important technical decisions and rationale.
- `docs/ASSUMPTIONS.md` — unresolved business requirements and temporary assumptions.
- `docs/PROGRESS.md` — completed work, current phase and next steps.

Keep documentation synchronized with the implementation.

When working with Git, use clear feature branches. Keep each screen or tightly related screen implementation isolated in its own feature branch where practical. Do not make unrelated changes in the same branch.

---

### 12. Testing and Definition of Done

A feature is not complete merely because its screen looks correct.

A feature is complete when:

- Its intended user journey works.
- Its frontend and backend integration works where applicable.
- Its data is correctly stored and retrieved.
- Invalid input is handled.
- Errors are handled.
- Authorization is enforced where necessary.
- It has been tested at relevant screen sizes.
- Its implementation is documented.

Test the main journeys:

**Fashion:** Browse products → View product → Add to cart → Update cart → Checkout workflow.

**Hotels:** Browse hotels → View hotel → Select room and dates → Submit reservation request → View reference.

**Apartments:** Browse apartments → View apartment → Select dates where applicable → Submit reservation request → View reference.

**Administration:** Log in → View dashboard → Create or update a product/property → Review orders/reservations → Update a status.

Do not report a test as passed unless it has actually been performed.

---

### 13. Scope Boundaries for This MVP

Do not expand the first release unnecessarily.

Unless separately approved, defer:

- Real payment gateway integration.
- Automated email and SMS notifications.
- Advanced analytics and reporting.
- Multi-country payment configuration.
- Complex staff permission systems.
- Multi-vendor marketplace functionality.
- Loyalty and rewards systems.
- Mobile applications.
- Advanced promotional campaigns.

Design the architecture so that these can be introduced later without rebuilding the entire platform.

---

### 14. First Instruction — Begin Here

**Do not start coding immediately.**

Start with Phase 0.

Inspect the repository, existing documentation, design references and available assets.

Then present:

1. Your understanding of the business.
2. Your assessment of the existing project.
3. The architecture you recommend.
4. The proposed folder structure.
5. The implementation phases.
6. The technical decisions that need approval.
7. The business requirements that still need client confirmation.
8. Any risks or problems you discovered.

Explain your recommendations in enough detail that I can understand and review them.

Wait for my approval before beginning Phase 1.

**The objective is to build a stable, usable and maintainable MVP—not to rush into producing large amounts of code.**