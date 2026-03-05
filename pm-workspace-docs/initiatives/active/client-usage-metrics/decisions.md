# Client Usage Metrics - Decision Log

## Decisions Made

| #   | Date       | Decision                                                           | Who                  | Why                                                                                                                                                                             | Alternative Considered                       |
| --- | ---------- | ------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | 2026-02-08 | Start with internal CS-facing dashboard (not client-facing)        | Tyler                | CS needs to see data before we expose it to clients; reduces privacy risk; faster to validate                                                                                   | Build client-facing ROI portal first         |
| 2   | 2026-02-08 | Aggregate at workspace level, not individual user                  | Tyler                | Privacy boundary; individual tracking raises trust concerns; workspace-level is sufficient for health scoring                                                                   | Per-user activity tracking                   |
| 3   | 2026-02-08 | Leverage existing PostHog telemetry, not build custom analytics    | Tyler                | ASK-4934 and ASK-4721 already instrument events; PostHog API can power dashboard without new data pipeline                                                                      | Custom analytics pipeline                    |
| 4   | 2026-02-08 | Target CSM and Sales Leader personas first                         | Tyler                | Churn analyses show CS needs this most urgently; Sales Leaders need it for expansion conversations                                                                              | RevOps automation first                      |
| 5   | 2026-02-11 | Add "By The Numbers" live-value mode as V2 extension               | Tyler                | QBR/renewal stories need visible proof of background automation; builds trust by making invisible work visible                                                                  | Separate standalone wallboard project        |
| 6   | 2026-02-12 | Prioritize renewal confidence layout for v10 based on Ben feedback | Tyler + Ben Harrison | Renewal negotiation workflows require fast proof: departmental usage, time saved, role-level adoption, executive usage, key feature activation, and CRM reliability in one view | Continue iterating artifact studio only (v9) |

## Open Decisions

| #   | Question                                                               | Options                                                           | Stakeholders                               | Target Date |
| --- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ | ----------- |
| 1   | Should clients see their own usage data?                               | Yes (transparency) / No (internal only) / Later (V3)              | Ben Harrison, Rob Henderson                | TBD         |
| 2   | Where does this live in the product?                                   | Dedicated page / Sidebar panel / Admin settings / HubSpot sync    | Skylar, Adam, Bryan                        | TBD         |
| 3   | What's the health score threshold for alerts?                          | Need baseline data from PostHog                                   | Dylan, Engineering                         | TBD         |
| 4   | HubSpot property sync for health score?                                | Sync to HubSpot / Keep in-platform only                           | James Hinkson, Engineering                 | TBD         |
| 5   | Which "live counters" are contractually reliable at launch?            | Core only / Full by-the-numbers / staged rollout                  | Dylan, Bryan, Skylar                       | TBD         |
| 6   | What is canonical definition of "query answered"?                      | assistant response success / user-confirmed helpful answer / both | Product + Engineering                      | TBD         |
| 7   | Should we expose a client-facing Insights API for external dashboards? | Internal-only dashboard / Partner API beta / Full public API docs | Ben Harrison, James Hinkson, Bryan, Sam Ho | TBD         |
