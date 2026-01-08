# Navigation Menu — Planning Document

## Purpose

The purpose of the navigation menu is to help users clearly understand where they are within the page and allow them to move between sections in a simple and intuitive way. Since the portfolio template is based on a single-page structure, the navigation must clearly reflect the currently visible section while remaining accessible and visually consistent.

---

## Design Goals

- Clearly indicate the **currently active section**
- Ensure that **only one navigation item** is highlighted at a time
- Maintain visual consistency with the rest of the template
- Support **keyboard navigation and screen readers**
- Avoid visual noise or distracting behavior while scrolling

---

## Visual & Interaction Approach

The navigation is designed to be minimal and unobtrusive, following the editorial aesthetic of the template.

Planned visual behavior:

- Non-active links use the accent color defined in the palette
- The active link is visually distinguished using a contrasting text color
- No additional icons or decorative elements are introduced
- Focus states are clearly visible for keyboard users

The interaction is intended to feel stable and predictable, avoiding flickering or rapid changes when scrolling.

---

## Active Section Logic (Planned)

To determine the active section, the navigation logic is based on the user’s scroll position rather than multiple overlapping observers.

Planned approach:

- The vertical center of the viewport is used as a reference point
- The section that contains this point is considered the active section
- Navigation links update accordingly to reflect this state

This approach was chosen to ensure consistent behavior across sections of different heights.

---

## Accessibility Considerations

Accessibility is a key part of the navigation planning:

- Navigation links use semantic anchor elements
- The active link includes `aria-current="page"` to support screen readers
- Keyboard focus states are preserved using `:focus-visible`
- Navigation remains fully usable without a mouse

---

## Technical Implementation Plan

- Use a single scroll-based update function to manage active states
- Throttle scroll updates using `requestAnimationFrame` for performance
- Avoid multiple observers or duplicated initialization logic
- Keep JavaScript logic simple and readable, aligned with a fundamentals-level project

---

## Testing Strategy

Planned testing includes:

- Scrolling through the page to confirm only one link is active at a time
- Verifying keyboard navigation using the Tab key
- Checking focus visibility on all navigation links
- Confirming correct behavior on different screen sizes

---

## Expected Outcome

The final navigation menu should feel stable, accessible, and visually integrated with the rest of the portfolio template. It should guide users naturally through the page while reinforcing clarity, structure, and usability.
