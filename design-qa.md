# Design QA

## 对照目标

- source visual truth: `C:\Users\zhang\AppData\Local\Temp\codex-clipboard-b4c236d7-fa1d-401d-ae9a-4eb11ca5011c.png`
- live interaction reference: `https://locomotive.ca/en` (active underline and hover text shuffle)
- supplemental logo asset source: `C:\Users\zhang\Desktop\exec-4a43a7ba-7d30-4685-bdd0-5c9ec7c4caa4.png`
- implementation screenshot: `C:\Users\zhang\.codex\visualizations\2026\09\01\01a05c48-a33d-7af2-beee-de821fb6a2e9\personal-website-nav-english-clean.png`
- homepage scroll screenshot: `C:\Users\zhang\.codex\visualizations\2026\09\01\01a05c48-a33d-7af2-beee-de821fb6a2e9\personal-website-home-about-scroll-final.png`
- responsive implementation screenshot: `C:\Users\zhang\.codex\visualizations\2026\09\01\01a05c48-a33d-7af2-beee-de821fb6a2e9\personal-website-home-top-logo-mobile-final.png`
- focused comparison input: `C:\Users\zhang\.codex\visualizations\2026\09\01\01a05c48-a33d-7af2-beee-de821fb6a2e9\top-logo-nav-comparison-final.png`
- hover evidence: `C:\Users\zhang\.codex\visualizations\2026\09\01\01a05c48-a33d-7af2-beee-de821fb6a2e9\personal-website-nav-english-hover.png`
- state: home page, rainy-store background, fixed reference-style header with English navigation, active underline, hover text shuffle, hidden weather widget, black entry preloader, and wheel momentum; About section rendered in the home page flow; Blog has a separate Markdown article view from Work with a pinned site-update log first

## 尺寸与归一化

- source pixels: `2549 x 1350`
- desktop implementation pixels / CSS viewport: `1280 x 720` / `1280 x 720`
- mobile implementation pixels / CSS viewport: `390 x 844` / `390 x 844`
- device scale factor: `1`
- focused comparison: `top-logo-nav-comparison-final.png` places the source resized to `1280 x 678` beside the `1280 x 720` implementation and includes matched-width top-header crops below. The source screenshot is a 2x-style capture and was normalized to the implementation width for visual comparison.

## 对照证据

### Full view

The desktop implementation follows the reference's four-zone header composition: left brand `Kobayashi`, supplied top logo, centered `Home / Blog / Work / Photo`, and right-aligned `Let's Connect`. The active item receives a thin underline. The header remains raised and the supplied logo stays reduced; the weather pill is not visible. The rainy convenience-store scene remains the homepage background. The home hero stays a full viewport and About is rendered immediately after it in the page flow.

### Focused region

The comparison board shows the same top-header hierarchy as the reference: left brand, secondary logo, centered navigation, and right CTA. The focused hover capture confirms the navigation text briefly shuffles and the active underline remains visible. The lower-left brand lockup remains in its existing position. The supplied top logo and `REN / DES / STU` mark are local image assets rather than CSS or inline-SVG redraws.

## Required fidelity surfaces

- Fonts and typography: the header brand, categories, contact, and mobile menu use the supplied `PingFangSC-Light` font with light weight and measured tracking. The lower-left Chinese name uses the same font, while the Latin dynamic text and subtitle keep the supplied `SamsungSharpSans` font with CJK fallbacks.
- Spacing and layout: the desktop header uses 12-column tracks aligned to the reference, with the header moved upward from the previous iteration. The home hero remains `100vh`, and About follows in the main flow. Mobile spacing keeps the brand, supplied logo, and menu control inside the viewport.
- Colors and visual tokens: header text and the supplied logo are white over the existing dark rainy-store scene. The active underline uses a restrained 1px white rule; the weather widget is intentionally hidden for this iteration, and the translucent mobile menu remains readable without covering the brand or hero content.
- Image quality and asset fidelity: `exec-4a43a7ba-7d30-4685-bdd0-5c9ec7c4caa4.png` was copied byte-for-byte to `assets/top-logo.png` and displayed without CSS or inline-SVG redrawing. The existing `REN / DES / STU` mark remains a local image asset.
- Copy and content: desktop categories are exactly `Home`, `Blog`, `Work`, `Photo`, followed by `Let's Connect`; the previous Chinese labels and `关于` category are removed. About copy is below the home hero and reachable by scrolling. Blog uses its own post index with the pinned `个人网站更新日志` first, Markdown article sources, and a local photographic cover on the field-notes post; Work retains the existing project list.
- Responsiveness: the `390 x 844` capture has no horizontal overflow; the mobile menu exposes `Home / Blog / Work / Photo / Let's Connect` in the requested order. Desktop and mobile retain the same hierarchy.
- States and interactions: the mobile menu open/close state was checked; Home, Blog, Work, and Photo each produce one active navigation item; Blog and Work retain separate hash routes and separate views; the hover shuffle restores text on mouse leave; homepage scroll shows About below the hero; the entry layer reveals the logo/name before fading into the home view; wheel input eases toward its target position while touch and keyboard scrolling remain native; the Blog Markdown renderer displays headings, image, quote, list, emphasis, divider, and code block.
- Accessibility: the header remains a semantic `nav`, the new logo has descriptive alt text, active links expose `aria-current="page"`, the mobile control exposes its English label and expanded state, and the decorative preloader is marked `aria-hidden`.

## Findings

No actionable P0, P1, or P2 findings remain.

Intentional differences from the reference are the existing rainy-store background, the user's supplied top logo, and the existing lower-left brand content. The Blog and Work views use the site's existing color-bends background, while the home view keeps the rainy-store model.

## Comparison history

1. Initial implementation exposed two P2-level polish issues: the global subtitle transform displayed the requested mixed-case copy as uppercase, and the previous mobile scale allowed the first row to run too wide.
2. Fixed with `text-transform: none`, reduced mobile title/mark/subtitle sizing, and a follow-up desktop/mobile capture.
3. The next comparison found the mark visually lower than the first-line title and the three-part lockup oversized. Fixed with centered row alignment and an approximately 10% desktop/mobile scale reduction.
4. Added mobile `overflow-wrap: anywhere` protection for longer dynamic title states.
5. Swapped the editable bottom-left typography to the supplied `QuickingRegular` font and verified desktop/mobile rendering.
6. Increased the lower-line letter spacing and explicitly assigned `QuickingRegular` to the upper dynamic English title.
7. Removed `Digital Artist` from the first-line dynamic cycle and assigned the supplied `PingFangSC-Light` font to the Chinese name.
8. Increased the external model iframe scale from `1.14` to `1.20` on desktop and from `1.07` to `1.13` on mobile to bring the background viewpoint closer without editing the model.
9. Removed the three homepage role tags and swapped Latin bottom-left text to the supplied `SamsungSharpSans` font.
10. Reduced the two editable text sizes while keeping the logo size unchanged.
11. Post-fix evidence: `personal-website-home-text-smaller.png`, `personal-website-home-samsung-tags-removed-mobile.png`, and `brandmark-layout-comparison-text-smaller.png`.
12. Replaced the centered pill header with a reference-style four-zone layout, copied the supplied top logo, changed the desktop order to `小林然 / Logo / 首页-帖子-项目-摄影 / 联系我`, moved the header upward, and kept the weather widget below it to avoid overlap.
13. Enabled About in the home page's post-hero flow and confirmed it appears after scrolling while the page remains on `data-page="home"`.
14. Post-fix evidence: `personal-website-home-top-logo-final.png`, `personal-website-home-about-scroll-final.png`, `personal-website-home-top-logo-mobile-final.png`, and `top-logo-nav-comparison-final.png`; console error check returned no errors.
15. The latest comparison found the supplied top logo still slightly oversized for the reference and the weather pill was no longer wanted. Reduced the desktop/mobile logo widths, raised the header slightly, and hid `.weather-widget` reversibly without editing the model or removing its existing fetch logic. Post-fix evidence: `personal-website-nav-weather-adjusted.png`; the browser check confirmed `weatherVisible: false` and title `Ren Kobayashi`.
16. Replaced the top-bar copy with `Kobayashi / Home / Blog / Work / Photo / Let's Connect`, restored a single active underline for each route, and replaced the old pill hover motion with the reference-style short text shuffle that immediately restores on leave. Post-fix evidence: `personal-website-nav-english-clean.png` and `personal-website-nav-english-hover.png`; browser checks covered all four routes and returned zero console errors.
17. Added a standalone black entry layer with the supplied top logo and `Kobayashi`, starting immediately on page load and fading the brand out before revealing the homepage. Added wheel-only momentum scrolling with reduced-motion handling; a local browser check captured the intro, exit, final state, and a 279px-to-520px eased scroll progression with zero console errors.
18. Split `Blog` from the Work project route, added a separate post index and Markdown article reader, copied the supplied `屋.jpg` to `assets/blog/house.jpg`, and verified the article image plus Markdown blocks. Blog and Work both keep the existing color-bends background; both routes were checked with zero console errors.
19. Added a short pinned `个人网站更新日志` Markdown post as the first Blog entry while retaining the original field-notes test post as the second selectable article.
20. Fixed the Blog article header inheriting the homepage's full-screen `header` minimum height, which had pushed the post body below a large blank area; the article header now uses a compact row layout.
21. Replaced the active navigation item's inherited text underline with a dedicated 1px white rule under the current `Home`, `Blog`, `Work`, or `Photo` label, while keeping the hover underline for inactive items.
22. Added the `随笔：Vibe Coding 之旅` Markdown post after the pinned update log, retained the original image-based test post, and expanded the Blog selector to three ordered entries.
23. Added `Tomatotodo 番茄待办 - 专注 APP` as the newest Work project dated `2026.08.23`, linked to its GitHub repository, and kept the existing project pagination in place.

## Implementation checklist

- [x] Use the supplied top logo as a local asset.
- [x] Show `Home / Blog / Work / Photo` in the desktop header.
- [x] Move About content into the home page's scroll flow.
- [x] Move the header upward and keep the reference-style four-zone layout.
- [x] Reduce the top logo and raise the header slightly for the latest reference.
- [x] Temporarily hide the weather widget while preserving its structure for later restoration.
- [x] Underline only the active navigation route and add reference-style hover text shuffle/recovery.
- [x] Add the black Logo/name entry animation and reveal the homepage after the brand exits.
- [x] Add inertial wheel scrolling without editing the Three.js model or taking over touch/keyboard scrolling.
- [x] Give Blog its own post/article view, put the short site update log first as a pinned post, and keep the Markdown source with a local image for the test article.
- [x] Keep Blog and Work on the same non-home background treatment while separating their content.
- [x] Keep the mobile menu in the same category order.
- [x] Preserve the existing lower-left brand content and requested fonts.
- [x] Keep the Three.js model source unchanged.

final result: passed
