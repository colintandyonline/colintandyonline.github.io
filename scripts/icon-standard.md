# CTDG Engineering & Innovation — icon design standard

Approved visual reference: the outline navigation and capability icons selected on 25 November 2026. Use Lucide 0.456.0, commit f93beca5957187620e30ae771d220d88501be621. The local SVG sprite is assets/icons.svg; its upstream licence is embedded and retained in scripts/lucide-license.txt. No icon CDN, font download, emoji substitutes, invented branding or mixing icon families.

## Semantic mapping

| Area | Lucide symbol |
| --- | --- |
| Engineering portal | globe |
| Engineering homepage / Showcase | house |
| Project explorer / Interactive engineering ecosystem | network |
| Individual project pages / Work portfolios | folder-code |
| Development roadmap | calendar-range |
| Engineering intelligence | chart-no-axes-combined |
| Live engineering intelligence / System status | activity |
| Innovation laboratory | flask-conical |
| Technology ecosystem | layers |
| Developer documentation | book-open |
| Releases and downloads | download |
| Engineering articles | newspaper |
| Developer community | users |
| Sponsorship and partnerships | heart-handshake |
| Contact engineering | mail |
| Privacy, terms, security and cookies | shield-check |
| Engineering services | code-xml |
| Cora / AI workforce | bot |
| Search | search |
| External destination | external-link |
| Forward action | arrow-right |
| Verified check | circle-check |

## Usage

Use the locally hosted sprite: `<svg class="ctdg-icon" width="18" height="18" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#house"></use></svg>`. Use a 24 x 24 viewBox, 2-unit rounded outline stroke, no fill. Default UI size 18px; compact navigation 16px; feature icons may be 24–28px. Use currentColor and existing CTDG cyan/navy/white tokens. Keep labels alongside navigation icons. Decorative icons are hidden from assistive technology; icon-only controls require accessible names and keyboard focus. Preserve the official CTDG logo and established button destinations.

Navigation on existing pages uses this standard. Future sections must use the mapped symbols when implemented. No claim is made that planned pages are already built.
