# Product Guidelines: BudgetByMe

## 1. User Experience & Interaction Design
- **Mobile-First Responsive Layout**: All dashboards, expense items, and modals must scale fluidly. Standard breakpoints must follow Tailwind CSS default screens, with a special focus on touch targets for mobile devices (min. 44x44px).
- **Loading & Optimistic States**: Every network request or database mutation must display clear feedback (e.g., loading spinners, skeleton UI, disabled buttons, or optimistic list updates) following the modal progress indicator patterns.
- **Accessibility (A11y)**: Focus states must be highly visible. Modals must contain focus traps and listen for the `Escape` key. All form elements must be associated with explicit label elements or `aria-label` properties.

## 2. Visual Style & Theme
- **Color Palette**: Sleek, cohesive, dark-mode compatible palette. Avoid default colors (pure red, blue, green). Utilize modern, sophisticated color tokens (e.g., slate/zinc for neutrals, violet/indigo for primary accents, emerald/rose for states).
- **Border Radius & Spacing**: Consistently use `rounded-xl` (12px) for cards, buttons, and input fields. Spacing should follow a strict 4px/8px-based grid hierarchy (`space-y-4`, `p-6`, etc.).
- **Typography**: Utilize Outfit or Inter as the primary sans-serif typeface to maintain high readability for financial numbers.

## 3. Form Validation & Data Integrity
- **Inline Validation**: Provide real-time validation via React Hook Form, presenting error states directly beneath input fields.
- **Destructive Actions**: Always present a clear confirmation dialog for irreversible actions (e.g., deleting an account, deleting an event, or clearing all payment history).
