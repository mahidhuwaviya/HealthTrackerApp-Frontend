# HealthTrack Cleanup Report

This report identifies technical debt, security loopholes, and architectural issues in the HealthTrack frontend.

## Security Loopholes

1.  **Input Validation**:
    - `WaterLogPopup.tsx`: Custom amount input only checks `amount > 0`. There is no upper bound (e.g., logging 10,000ml in one go).
    - `MealEntryPopup.tsx` and `WorkoutLogPopup.tsx` (to be audited) likely share similar lacks of boundary checks.
2.  **Auth Persistence**:
    - Reliance on `localStorage` for some state (like `hasSeenWelcomeModal`) is fine, but ensure sensitive tokens are handled securely (audited `api/client.ts` would be next if tokens were handled there).

## Technical Debt & Architectural Issues

1.  **Data Consistency (The 'Object' Glitch)**:
    - The optimistic update in `WaterLogPopup.tsx` incorrectly adds a number to a potential object (`WaterTotalDTO`), causing `[object Object]` to display.
    - Property naming mismatches in `ExerciseEntry` (`durationMinutes` vs `duration`) lead to fragile reduction logic in views.
2.  **Global State Management**:
    - Loading states are currently managed locally in `DashboardPage.tsx` and within individual popups. This leads to the "Navbar flickering" or "loader alongside Navbar" issue.
    - Moved to a global React Portal approach based on `useIsFetching` and `useIsMutating`.
3.  **Hardcoded Defaults**:
    - Default goals (e.g., 45 mins for workouts, 2000ml for water) are duplicated across components or hardcoded instead of strictly following `config/health-constants.ts`.
4.  **Timezone/Date Fragility**:
    - Many components assume "Today" without explicit timezone synchronization between the Aiven MySQL backend and the client. This can lead to logs "disappearing" at the turn of the day.

## Logic Duplication

1.  **Total Calculations**:
    - Calculating total workout duration is performed in both `OverviewView.tsx` and `WorkoutsView.tsx` using slightly different fallback logic.
2.  **Icon Mapping**:
    - Metric-to-icon mapping is repeated in multiple dashboard views.

## Recommended Fixes

- Implement a robust `DataTransformer` utility to normalize backend DTOs before they reach the UI.
- Use a global `LoadingProvider` or React Query's global hooks to manage the `GlassLoader`.
- Centralize all default values in a single config file.
- Standardize on a date library (like `date-fns`) and ensure all API calls include the user's timezone.
