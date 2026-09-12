# Apple David Pet Grooming

create a Pet grooming booking system called Apple David. it should contain the following modules + a simple log in page: Module 1 — Dashboard / Booking List

This is the main page.

Display:

PawCare Pet Grooming Booking System

[ + New Booking ]

Search bookings...

Code Owner Pet Service Date Status

BK-001 Maria Mochi Full Groom Sept 15 Confirmed BK-002 Juan Bruno Bath & Dry Sept 16 Pending

                Edit | Delete

Optional small statistics at the top:

Total Bookings: 12 Pending: 4 Confirmed: 5 Completed: 3

These statistics are optional. Don't make them too complicated.

Module 2 — Create Booking

A form:

Owner Information

Owner Name

[ Maria Santos ]

Pet Information

Pet Name

[ Mochi ]

Pet Type

[ Dog ▼ ]

Grooming

Service

[ Full Grooming ▼ ]

Possible services:

Bath & Dry — ₱250

Basic Grooming — ₱350

Full Grooming — ₱500

Nail Trimming — ₱150

Appointment

Date

[ September 15, 2026 ]

Time

[ 10:00 AM ]

Price

The price should automatically correspond to the selected service.

Example:

Service: Full Grooming Price: ₱500

Status

Default:

Pending

Then:

[ Save Booking ] [ Cancel ]

Module 3 — Read / View Booking

Clicking a booking should show its details.

For example:

Booking Details

Booking Code: BK-001

Owner Maria Santos

Pet Mochi Dog

Service Full Grooming

Appointment September 15, 2026 10:00 AM

Price ₱500

Status Confirmed

[ Edit ] [ Delete ]

This gives you an explicit READ function.

Module 4 — Update Booking

The same form can be reused.

Example:

Edit Booking

Owner Name [ Maria Santos ]

Pet Name [ Mochi ]

Pet Type [ Dog ▼ ]

Service [ Full Grooming ▼ ]

Date [ September 15 ]

Time [ 10:00 AM ]

Status [ Confirmed ▼ ]

[ Save Changes ]

After saving, the updated value must be reflected in the database.

This is important because database persistence is specifically part of your activity.

Module 5 — Delete Booking

Each booking has:

[ Delete ]

When clicked:

Are you sure you want to delete booking BK-001?

[ Cancel ] [ Delete ]

Then the record should actually be removed from the database.

Basic Search / Filter

I recommend adding simple search because it gives your testers another useful test scenario without making the application complicated.

Search by:

owner name

pet name

booking code

Example:

🔍 Search bookings...

You could also add a simple status filter:

All ▼ Pending Confirmed Completed Cancelled

Don't add complicated multi-filter functionality.

Validation Rules

This is VERY important because your activity specifically requires basic form validation.

The system should normally enforce:

Required fields

These cannot be blank:

Owner Name

Pet Name

Pet Type

Service

Appointment Date

Appointment Time

Example:

Owner Name * [ ]

⚠ Owner name is required.

Date validation

Appointment date should not be in the past.

Example:

Appointment Date: September 10, 2025

❌ Appointment date cannot be in the past.

Name validation

Don't accept something like:

Owner Name: 123456

Basic validation can require letters and spaces.

Price validation

Price must be:

0

No:

-500 0

Duplicate booking

A booking should not allow the same pet to have two bookings at the exact same date and time.

Example:

Mochi Full Grooming September 15 10:00 AM

already exists.

Trying to create another identical appointment should produce:

This pet already has a booking at this date and time.

This is a very good business rule to test.

Service Pricing

Keep the pricing logic simple.

ServicePriceBath & Dry₱250Basic Grooming₱350Full Grooming₱500Nail Trimming₱150

When the user selects:

Full Grooming

the price becomes:

₱500

You can use this later for one of your intentional defects.

Status Workflow

Use only four statuses:

Pending Confirmed Completed Cancelled

Default status:

Pending

please use the attached photo for the design reference, just change some elements to match the "pet" grooming system. make the name/logo "Apple David" in cute handwritten cursive font
html css. front end only for now

## Development

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
