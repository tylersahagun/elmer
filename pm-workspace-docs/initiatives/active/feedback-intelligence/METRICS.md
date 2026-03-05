# Metrics - Feedback Intelligence

## North Star

Reliable, actionable customer signal intelligence that distinguishes recurring and novel feedback with trustworthy customer identity.

## Success Metrics

1. Identity linkage rate
- Definition: Percent of new feedback rows linked to a Company and at least one Contact.
- Target: >= 95% within 30 days of rollout.

2. Deduping precision
- Definition: Percent of merged child events correctly attached to parent issue (manual QA sample).
- Target: >= 90% weekly precision.

3. Novelty precision
- Definition: Percent of "Novel" items that are truly net-new themes after PM review.
- Target: >= 80% within first month.

4. Digest reliability
- Definition: Daily digest delivered at 4:30 PM MT and weekly rollup delivered on schedule.
- Target: 100% on-time delivery; <= 1 missed send per quarter.

5. Time-to-triage
- Definition: Median time from ingestion to parent assignment for low-confidence items.
- Target: < 24 hours.

## Leading Indicators

1. Occurrence count growth on top 10 parent issues.
2. Week-over-week change in novel issue volume.
3. Percent of rows requiring manual identity correction.

## Failure Signals

1. Linkage rate < 90% for 2 consecutive weeks.
2. Novelty false-positive rate > 30%.
3. Daily digest misses 2+ sends in a 14-day window.
