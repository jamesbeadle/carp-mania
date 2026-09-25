# Refactor audit

Generated 2026-09-25 06:38 UTC.

## Headline

**Code quality score 78.6%.** **0 of 946 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **93.1%** | **52** | |
| Files over the line limit | 0 in 946 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 7 in 1771 functions | 98.4% | 8 | 25% of functions |
| Else blocks | 2 in 1295 branches | 99.7% | 5 | 50% of branches |
| Duplication % | not measured | not measured | — | 20 |
| Explanatory comment lines | 0 in 31.29 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 53 in 31.29 thousand lines | 91.5% | 4 | 20 per thousand lines |
| Orphan components and functions | 45 in 2028 components and functions | 77.8% | 4 | 10% of components and functions |
| Long member chain lines | 463 in 31.29 thousand lines | 50.7% | 4 | 30 per thousand lines |
| Deeply indented lines | 40 in 31.29 thousand lines | 95.7% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1771 functions | 97.7% | 4 | 10% of functions |
| **Design pattern file count** | | **48.1%** | **20** | |
| Files the patterns predict but are missing | 1 in 52 predicted files | 96.2% | 10 | 50% of predicted files |
| Entities outside their expected file count | 13 in 24 entities | 0.0% | 10 | 50% of entities |
| **Prose** | | **71.5%** | **20** | |
| Conditions with calls tangled inside calls | 56 in 1295 branches | 82.7% | 8 | 25% of branches |
| Conditions compared to a raw literal | 224 in 1295 branches | 30.8% | 6 | 25% of branches |
| Accessor names that want to be a property | 5 in 1771 functions | 97.2% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 303 | 292 | 9,478 |
| domain | 236 | 236 | 8,696 |
| game | 191 | 191 | 7,361 |
| backend | 157 | 157 | 4,249 |
| tooling | 100 | 0 | 0 |
| database | 76 | 0 | 0 |
| shared | 60 | 58 | 1,411 |
| tests | 28 | 0 | 0 |
| docs | 23 | 0 | 0 |
| api | 12 | 12 | 91 |
| infrastructure | 8 | 0 | 0 |
| other | 1 | 0 | 0 |
| **whole repository** | **1,195** | **946** | **31,286** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 946, totalLines: 31286, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 7, totalFunctions: 1771, elseBlocks: 2, ifBlocks: 1295, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 5, measurementIsHeuristic: True |
| duplication | skipped: jscpd is not installed (npm install -g jscpd) |
| naming | bannedAbbreviationHits: 0, unprefixedBooleans: 13 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 23, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 463, deeplyIndentedLines: 40, overlongLines: 600, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 56, literalComparisonLines: 224, measurementIsHeuristic: True |
| orphans | orphanFunctions: 44, functionsExamined: 1771 |
| designPatterns | roleFamilies: 45, predictedFiles: 52, predictedFilesMissing: 1, entities: 24, entitiesOutOfRange: 13, measurementIsHeuristic: True |
| inventory | pages: 27, components: 257, orphanComponents: 1, averagePageLines: 41 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| fileAreas | totalFiles: 1195, frontend: 303, domain: 236, game: 191, backend: 157, tooling: 100, database: 76, shared: 60, tests: 28, docs: 23, api: 12, infrastructure: 8, other: 1 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | not measured | 78.6% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 7 | 7 | held |
| functionShape.elseBlocks | 2 | 2 | held |
| duplication.duplicatedPercentage | None | None | — |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 1 | 1 | held |
| orphans.orphanFunctions | None | 44 | — |
| prose.longMemberChainLines | 603 | 463 | better |
| prose.deeplyIndentedLines | 59 | 40 | better |
| functionNames.overlongFunctionNames | 4 | 4 | held |
| accessorNames.gluedAccessorNames | None | 5 | — |
| conditions.tangledConditionLines | None | 56 | — |
| conditions.literalComparisonLines | None | 224 | — |
| designPatterns.predictedFilesMissing | None | 1 | — |
| siteDefinition.handRolledElements | None | None | — |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
