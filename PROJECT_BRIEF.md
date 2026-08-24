You are a senior product architect and full-stack developer. Help me design a complete implementation plan for a personal life-tracking web application.

## Project overview

The application currently has two primary purposes:

### 1. Productivity and time management

I want to organize my daily, weekly, and monthly tasks and responsibilities.

The application should allow me to:

* Create tasks with priorities, deadlines, categories, and estimated durations.
* plan each day using an hourly calendar and time blocks.
* Schedule activities such as gym, chores, development work, appointments, and personal responsibilities.
* Start and stop timers to track the actual time spent on activities.
* Compare planned time with actual time.
* Review daily, weekly, and monthly productivity.
* Reschedule unfinished tasks easily.
* Create recurring tasks and routines.

I have mild ADHD-related focus difficulties, so the application should make planning and completing activities engaging without becoming distracting. Consider features such as:

* A clear “What should I do now?” view.
* Focus timers and distraction-free task modes.
* Visual progress indicators.
* Small completion rewards or streaks.
* Breaking large tasks into manageable steps.
* Low-friction task entry.
* Limited daily priorities to prevent overwhelming the user.

These features should encourage productivity without using excessive or manipulative gamification.

### 2. Monthly bill tracking

I want to track recurring and one-time bills.

The application should allow me to:

* Add bills with names, amounts, categories, due dates, and recurrence rules.
* See bill due dates on a monthly calendar.
* View upcoming bills in chronological order.
* Mark bills as paid, unpaid, overdue, or automatically paid.
* See the total amount due during the current month.
* Receive clear warnings for upcoming and overdue bills.
* Preserve payment history.
* Support bills whose amounts vary each month.

Do not include banking integrations, automatic payments, or financial-account connections in the initial version.

## Technical preferences

My preferred frontend stack is:

* Vite
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React

Recommend the most suitable supporting technologies for:

* Backend and API
* Database
* Authentication
* Calendar and time-blocking interface
* State management
* Form validation
* Recurring tasks and bills
* Notifications
* Hosting and deployment
* Testing
* Data backup and export

Prefer technologies that are fast for one developer to build with, free to use, well documented, and capable of supporting future features. Avoid unnecessary enterprise architecture and premature microservices.

Evaluate if wether Supabase or mongoDB atlas would be a good choice. If you recommend something else, explain why it is a better fit.

The application should initially be a responsive web app. Explain whether making it a PWA would provide meaningful value, particularly for mobile use and reminders.

## Your task

Do not write application code yet.

First, identify any important unanswered product or technical questions. Ask only questions whose answers would materially change the architecture or MVP. If reasonable assumptions can be made, state them instead of blocking the plan.

Then create a detailed implementation plan containing:

1. A concise definition of the product and its core user experience.
2. The recommended technology stack, including the purpose of every major technology.
3. A clearly defined MVP that prevents feature creep.
4. Features that should be postponed until after the MVP.
5. The application’s main pages and navigation structure.
6. The core user flows for:

   * Creating and completing a task
   * Planning a day with time blocks
   * Tracking actual time
   * Rescheduling unfinished work
   * Creating and paying a bill
   * Reviewing upcoming and overdue bills
7. A proposed database schema with the main tables, important fields, and relationships.
8. A feature-by-feature build order organized into development phases.
9. For every phase:

   * Features to implement
   * Dependencies
   * Acceptance criteria
   * Important edge cases
   * Suggested tests
10. A recommendation for how planned tasks, calendar blocks, and actual time-tracking sessions should relate to one another in the data model.
11. A strategy for recurring tasks and recurring bills.
12. A notification strategy, including realistic browser and PWA limitations.
13. Security and privacy considerations for personal and financial data.
14. Deployment instructions and an estimated monthly operating cost.
15. A list of architectural decisions that should be documented before development begins.
16. A prioritized post-MVP roadmap.

## Build-order requirements

The build order must be practical for a solo developer. Each phase should result in something testable and usable.

Use approximately this progression unless you can justify a better sequence:

1. Project foundation and authentication
2. Core task management
3. Daily planning and time blocking
4. Actual time tracking
5. Weekly and monthly planning
6. Bill management
7. Bill calendar and chronological upcoming-bills view
8. Productivity and financial summaries
9. ADHD-friendly focus and engagement features
10. Notifications, PWA support, testing, and deployment

Point out dependencies that make this sequence inefficient or risky.

## Product discipline

Challenge my assumptions when necessary. Specifically identify:

* Features that sound simple but are technically complicated.
* Features likely to create scope creep.
* Data-model decisions that would be difficult to change later.
* UX ideas that could become distracting instead of productive.
* Areas where tasks, calendar events, routines, and time entries might overlap or become confusing.
* Any feature that should be simplified for the first version.

Do not give me a generic project-management checklist. Make concrete architectural and product decisions and explain the most important tradeoffs.

Finish with:

* Your final recommended MVP feature list.
* A numbered build sequence I can follow from an empty repository to deployment.
* The first five development tasks I should give an AI coding agent.
* A proposed folder structure for the finished application.
