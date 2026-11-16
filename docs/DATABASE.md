# Database

The project is configured around PostgreSQL and a modular schema that supports the MVP domains.

## Core entities

- users
- admins
- products
- product_categories
- product_variations
- carts
- cart_items
- orders
- order_items
- hotels
- hotel_room_types
- hotel_reservations
- apartments
- apartment_reservations
- payments

## Design principles

- Use UUID primary keys for future portability and safe record references
- Add foreign key relationships for all transactional child records
- Add indexes for listing, filtering and status queries
- Keep reservation and payment data separate from customer identity data
- Plan for availability validation, double-booking prevention and inventory checks

## Future work

The schema is intentionally designed for expansion into real inventory, reservation status workflows and payment processing without forcing a rebuild.
