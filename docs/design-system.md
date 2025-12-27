# Gym Tracker v2 - Design System

This document defines the visual and interactive language for the Gym Tracker v2 mobile application. It ensures a consistent, premium, and highly functional experience tailored for the high-energy, focused environment of a gym.

## 0. Implementation Technology

The design system is implemented using:

- **[NativeWind v4](https://www.nativewind.dev/)**: For utility-first styling using Tailwind CSS classes.
- **[gluestack-ui v2](https://gluestack.io/)**: For accessible, high-performance UI components (Buttons, Modals, Inputs) that are styled with NativeWind and follow the copy-paste architecture.

### Styling Strategy

We employ a dual-strategy approach for styling Gluestack components to balance consistency with flexibility:

1. **Variant-Based Styling (The Component Way)**:
    - **Purpose**: Use for macro-level component states defined in our design system (e.g., Primary Buttons, Error Alerts, Small Inputs).
    - **Mechanism**: Use the built-in props defined in the component files (`components/ui/**/index.tsx`).
    - **Example**: `<Button action="positive" variant="outline" size="lg">`

2. **Usage-Site Styling (The Utility Way)**:
    - **Purpose**: Use for layout (`flex`, `margin`), spacing, and one-off visual tweaks.
    - **Mechanism**: Use the `className` prop with standard Tailwind classes.
    - **Prerequisites**: Utilize semantic colors from `tailwind.config.js` (e.g., `bg-primary-500`) rather than arbitrary hex values.
    - **Example**: `<Button className="mt-4 w-full bg-primary-energy">`

## 1. Visual Foundations

### 1.1 Color Palette

The palette is designed for high legibility in various lighting conditions (bright gyms or low-light home setups). It prioritizes "Energy" and "Clarity".

| Token | Hex | Purpose |
| :--- | :--- | :--- |
| **Surface-Deep** | `#121212` | Main background (Dark Mode) |
| **Surface-Elevated** | `#1E1E1E` | Card backgrounds, list items |
| **Primary-Energy** | `#4F46E5` | Indigo - Primary actions, active states |
| **Success-Growth** | `#10B981` | Emerald - Logged sets, progression success |
| **Accent-Warning** | `#F59E0B` | Amber - Rest timer active, alerts |
| **Error-Critical** | `#EF4444` | Red - Abandoned sessions, errors |
| **Text-Primary** | `#FFFFFF` | High emphasis text |
| **Text-Muted** | `#94A3B8` | Slate - Secondary info, labels |

### 1.2 Typography

We use **Inter** (system default if unavailable) for its modern feel and excellent legibility at small sizes.

- **Headline (H1)**: 28px, Bold, High Emphasis (Screen Titles)
- **Sub-headline (H2)**: 20px, Semi-bold, High Emphasis (Section Headers)
- **Body-M (Default)**: 16px, Regular, High Emphasis (Primary content)
- **Body-S (Small)**: 14px, Regular, Medium Emphasis (Descriptions, muted info)
- **Numeric-L**: 32px, Monospace/Bold (Timer countdown, weights)

### 1.3 Spacing & Layout

A **4px/8px Baseline Grid** ensures consistent rhythm.

- **4px**: Micro-adjustments (icon to text).
- **8px**: Small spacing (item internal padding).
- **16px**: Standard spacing (gap between list items).
- **24px**: Section spacing.
- **Corner Radius**: 12px for cards/buttons (Soft-modern feel).

---

## 2. Interface Components

### 2.1 Buttons

- **Primary Action**: Full-width, `Primary-Energy` background, White text. High elevation shadow.
- **Secondary Action**: Outline or Ghost style. Subtle border in `Text-Muted`.
- **Log Set Button**: Circular, large touch target (48x48px min). `Success-Growth` when logging.

### 2.2 Cards

- **Program Card**: Displays name, last completed date, and a "Start" shortcut.
- **Exercise Item**: Shows current weight/difficulty, target reps, and progression status.
- **History Card**: Compact, showing date, program name, and a status badge (Completed/Abandoned).

### 2.3 Input Controls

- **Numeric Stepper**: Big `-` and `+` buttons flanking a central numeric value. Essential for weight/rep adjustments with sweaty/shaky hands.
- **Picker/Dropdown**: Clean, bottom-sheet style selection for programs and exercises.

## 3. Specialized Workout UI

### 3.1 The Rest Timer

- **Visual**: A large, centered countdown (`Numeric-L`).
- **Progress**: A circular progress ring (`Accent-Warning`) that depletes as time runs out.
- **Interaction**: "Skip" and "+30s" buttons clearly accessible at the bottom.

### 3.2 Logging Experience

- **One-Tap Logging**: Tapping the "Target" value should instantly log it as the "Actual" value.
- **Haptic Feedback**: Subtle vibration on set completion.
- **Success State**: The row/card turns subtly green when a set is successfully logged.

---

## 4. Interaction & Feedback

- **Transitions**: Smooth slide animations between exercises.
- **Status Badges**:
  - `SUCCESS`: Emerald pill with white text.
  - `IN PROGRESS`: Indigo pill.
  - `ABANDONED`: Red pill.
- **Progression Alert**: A celebratory modal/overlay when an exercise reaches progression (e.g., "Level Up! New Weight: 105kg").

---

## 5. Accessibility & Theming

- **Dark Mode First**: The default and optimized theme.
- **Touch Targets**: All interactive elements are at least **44x44px**.
- **Contrast**: Ensuring WCAG AA compliance (4.5:1) for all critical text.

## 6. Notifications (Toasts)

To maintain a clean and uncluttered UI, we enforce a **Single Active Toast** pattern.

- **Behavior**: New toasts **replace** existing ones instead of stacking vertically.
- **Implementation**: Always provide a unique `id` (e.g., `id: 'gym-tracker-toast'`) when calling `toast.show()`.
- **Placement**: Top of the screen (`placement: 'top'`).
- **Duration**: Short duration for success/info, indefinite or longer for errors that require reading.
