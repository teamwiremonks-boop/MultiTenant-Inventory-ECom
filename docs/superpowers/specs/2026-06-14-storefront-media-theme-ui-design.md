# Storefront Media, Theme, and Vendor Header UI Design

## Goal

Improve the storefront media and content presentation, make theme switching consistently available in existing application headers, and simplify the vendor header by removing unused filters.

## Scope

This change includes four related UI updates:

1. Remove vendor dashboard filters on every viewport because product, brand, and store search are not implemented as complete user workflows.
2. Render authored product descriptions as sanitized rich HTML, clamped to three visual lines on product cards and displayed fully on product detail pages.
3. Display multiple selected-SKU or default product images as a swipeable card carousel and a responsive product-detail bento gallery.
4. Replace the existing theme dropdown with a direct light/dark icon toggle in the storefront and vendor headers.

This change does not add search, alter Supabase tables or RPCs, add autoplay, add carousel arrows, or place a theme control on headerless authentication and checkout screens.

## Architecture

The implementation will use small focused components shared by the storefront surfaces:

- `RichDescription` owns HTML sanitization and rich-content rendering modes.
- `ProductImageCarousel` owns the compact product-card image interaction.
- `ProductImageBento` owns the product-detail gallery layout.
- `ThemeToggle` owns mounted-state handling and direct light/dark switching.

The existing storefront normalization module will retain complete image arrays for products and variants. A pure helper will choose the active gallery: selected SKU images when the SKU has authored images, otherwise default product images. The returned gallery is limited to five images.

The existing `VendorFilters` component will be removed from `VendorShell`. The source file may also be deleted if it has no remaining consumers.

## Product Image Data Flow

`publicProductToCard` and `publicProductToDetail` will expose default product image URLs. Each normalized variant will expose both:

- `imageUrl`: the first effective image, retained for cart compatibility.
- `imageUrls`: all authored images for that variant without default images mixed in.

A pure gallery-selection helper will accept default product images and a selected variant:

1. If the selected variant has one or more authored `imageUrls`, return those images.
2. Otherwise return the default product images.
3. Remove empty or non-string values and duplicate URLs.
4. Return at most five images.

SKU images replace the default gallery rather than being merged with it.

## Product Card Carousel

Product cards will use a shadcn Carousel backed by Embla where available in the project tooling. The carousel will:

- Support pointer drag and touch swipe.
- Show no previous/next arrows.
- Show one clickable dot for each image.
- Mark the active dot accessibly.
- Reset to the first slide when the selected variant changes the effective image gallery.
- Preserve the current muted `No image` fallback when no image exists.
- Use responsive `next/image` sizing and avoid eager loading every card image.

The carousel remains compact within the existing card aspect ratio. Selecting product options continues to update price, availability, cart identity, and now the effective image gallery.

## Product Detail Bento Gallery

The product detail page displays at most five effective images.

Desktop and tablet layouts:

- 1 image: one full-width image.
- 2 images: one row with equal 50/50 columns.
- 3 images: first row contains image 1 at full width; second row contains images 2 and 3 at 50/50.
- 4 images: two rows, each with 50/50 columns.
- 5 images: first row contains images 1 and 2 at a 3:2 width ratio; second row contains images 3, 4, and 5 in equal one-third columns.

Mobile layout:

- Every image is full width.
- Images stack vertically in authored order.

Each tile uses a consistent responsive aspect ratio, rounded border treatment, `next/image`, and meaningful product alt text. Selecting another SKU immediately replaces the displayed bento images according to the SKU-first fallback rule.

## Rich Description Rendering

Product descriptions authored by the existing rich text editor are treated as HTML and must be sanitized before rendering.

Allowed content includes ordinary presentational elements such as paragraphs, line breaks, headings, ordered and unordered lists, list items, emphasis, strong text, and safe links. Sanitization removes:

- Scripts and executable embedded content.
- Inline event handlers.
- Unsafe URL schemes such as `javascript:`.
- Unsupported iframes, objects, forms, styles, and arbitrary attributes.

Product cards render sanitized HTML in a compact typography style clamped to three visual lines. Product detail pages render the full sanitized description with readable spacing for paragraphs and lists. Empty sanitized output falls back to the existing card placeholder and renders nothing on the detail page.

Sanitization must be deterministic and testable independently from React rendering. The implementation must not pass raw vendor-authored HTML directly to `dangerouslySetInnerHTML`.

## Theme Toggle

The current Light/Dark/System dropdown becomes an icon-only direct toggle:

- In light mode, display a moon icon and label it `Switch to dark theme`.
- In dark mode, display a sun icon and label it `Switch to light theme`.
- If the stored preference is `system`, resolve the current theme and the first click explicitly selects the opposite concrete theme.
- Render a stable icon-button placeholder until the component mounts to avoid hydration mismatch.
- Use a shadcn icon `Button` with keyboard focus styling and a tooltip or accessible label.

The toggle appears in:

- The public storefront header for guests, customers, and vendors.
- The vendor workspace header.

It will not be added as a fixed overlay to login, signup, checkout, profile, or order pages that lack one of these headers.

## Vendor Header

Remove `VendorFilters` from the vendor header for all breakpoints. The header retains vendor identity, logout, theme toggle, and mobile navigation. Removing the filter row should reduce mobile header height and eliminate non-functional query-string controls.

No replacement dropdown is added until a real search/filter workflow is implemented.

## Accessibility

- Carousel dots are buttons with slide-position labels and an active state.
- Drag and swipe are optional enhancements; every slide remains reachable through clickable dots.
- Theme controls expose the action that will occur, not only the current icon.
- Bento images have useful alt text and maintain readable contrast in both themes.
- Sanitized links preserve keyboard behavior and safe link attributes.
- Hidden or clamped rich content must not introduce interactive elements that are visually inaccessible on product cards; links should be removed or made non-interactive in the clamped card mode.

## Performance

- Keep selection and active-slide state local to the consuming card or gallery.
- Derive effective images during render or with narrowly scoped memoization; do not mirror them through effects.
- Use stable image URLs as keys.
- Use `next/image` responsive `sizes` values.
- Avoid autoplay, global event listeners, and eager loading of offscreen card images.
- Import carousel and UI primitives directly rather than adding broad barrel exports.

## Testing

Follow test-driven development.

Pure helper tests will cover:

- SKU images taking precedence over default images.
- Default fallback when a SKU has no authored images.
- Duplicate, invalid, and excess image handling.
- Preservation of all normalized variant image URLs.
- HTML sanitization of scripts, event attributes, unsafe links, and unsupported elements.
- Preservation of allowed rich-text structure.
- Bento layout classification for one through five images.

Component or browser verification will cover:

- Product card dots select slides and swipe/drag changes the active slide.
- Carousel resets when option selection changes the effective gallery.
- Rich descriptions are clamped on cards and fully rendered on detail pages.
- Bento layouts match the approved desktop rules and stack full width on mobile.
- Theme toggle changes light/dark mode from storefront and vendor headers.
- Vendor header no longer renders filters on desktop or mobile.
- No hydration errors, framework overlays, or relevant console errors.

Final verification includes the complete Node test suite, TypeScript, ESLint, production build, and Browser checks at desktop and mobile viewports.

## Error and Empty States

- No images: retain the `No image` placeholder.
- One image: carousel controls are omitted and the bento uses a single tile.
- Invalid description HTML: unsafe content is removed; safe remaining content renders normally.
- Empty description after sanitization: use the existing product-card fallback and omit the detail description section.
- Theme unavailable before mount: render a disabled stable icon button until hydration completes.

## Non-Goals

- No backend or Supabase changes.
- No image lightbox or full-screen viewer.
- No carousel autoplay or arrow controls.
- No more than five storefront gallery images.
- No vendor search/filter implementation.
- No redesign of authentication, checkout, profile, or order headers.
