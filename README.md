Anna AI — HSK Store Update

Included:
- app/hsk/store/page.tsx
- app/hsk/store/store-animations.css
- components/hsk/HskStoreGrid.tsx

Changes:
- HSK 2–9 Full Package is rendered first.
- Animated glow, shimmer, sparkles and discount badge.
- Individual HSK 2–9 cards appear below.
- Mobile responsive.
- No extra npm package required.

Install:
1. Extract the ZIP in your project root.
2. Replace the existing files.
3. Run:
   npm run type-check
   npm run build

Payment query values used:
- Full package: /payment?product=hsk-full-package
- Individual: /payment?product=hsk-2 through hsk-9

If your current payment product IDs differ, update the href product values in:
components/hsk/HskStoreGrid.tsx
