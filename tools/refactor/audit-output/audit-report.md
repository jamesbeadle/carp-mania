# Refactor audit

Generated 2026-09-17 11:23 UTC.

## Headline

**Code quality score 78.9%.** **0 of 706 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **91.5%** | **60** | |
| Files over the line limit | 0 in 706 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 7 in 1287 functions | 97.8% | 8 | 25% of functions |
| Else blocks | 2 in 1109 branches | 99.6% | 5 | 50% of branches |
| Duplication % | 0.14 | 99.3% | 8 | 20 |
| Explanatory comment lines | 0 in 23.75 thousand lines | 100.0% | 4 | 50 per thousand lines |
| Inline magic values | 50 in 23.75 thousand lines | 89.5% | 4 | 20 per thousand lines |
| Orphan components and functions | 21 in 1475 components and functions | 85.8% | 4 | 10% of components and functions |
| Long member chain lines | 603 in 23.75 thousand lines | 15.4% | 4 | 30 per thousand lines |
| Deeply indented lines | 59 in 23.75 thousand lines | 91.7% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1287 functions | 96.9% | 4 | 10% of functions |
| **Design pattern file count** | | **50.0%** | **20** | |
| Files the patterns predict but are missing | 0 in 48 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | 17 in 27 entities | 0.0% | 10 | 50% of entities |
| **Prose** | | **70.0%** | **20** | |
| Conditions with calls tangled inside calls | 46 in 1109 branches | 83.4% | 8 | 25% of branches |
| Conditions compared to a raw literal | 207 in 1109 branches | 25.3% | 6 | 25% of branches |
| Accessor names that want to be a property | 4 in 1287 functions | 96.9% | 6 | 10% of functions |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 227 | 216 | 7,620 |
| game | 152 | 152 | 5,976 |
| domain | 149 | 149 | 5,160 |
| backend | 136 | 136 | 3,903 |
| tooling | 76 | 0 | 0 |
| database | 46 | 0 | 0 |
| shared | 45 | 43 | 984 |
| docs | 21 | 0 | 0 |
| tests | 19 | 0 | 0 |
| api | 10 | 10 | 109 |
| infrastructure | 8 | 0 | 0 |
| other | 1 | 0 | 0 |
| **whole repository** | **890** | **706** | **23,752** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 706, totalLines: 23752, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 7, totalFunctions: 1287, elseBlocks: 2, ifBlocks: 1109, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 4, measurementIsHeuristic: True |
| duplication | clones: 6, duplicatedLines: 39, totalLines: 28425, duplicatedPercentage: 0.14 |
| naming | bannedAbbreviationHits: 0, unprefixedBooleans: 10 |
| comments | explanatoryCommentLines: 0, filesWithComments: 0, taskMarkers: 0 |
| magicValues | inlineHexColours: 0, inlineStyleAttributes: 20, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 603, deeplyIndentedLines: 59, overlongLines: 388, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 46, literalComparisonLines: 207, measurementIsHeuristic: True |
| orphans | orphanFunctions: 20, functionsExamined: 1287 |
| designPatterns | roleFamilies: 32, predictedFiles: 48, predictedFilesMissing: 0, entities: 27, entitiesOutOfRange: 17, measurementIsHeuristic: True |
| inventory | pages: 25, components: 188, orphanComponents: 1, averagePageLines: 45 |
| fileAreas | totalFiles: 890, frontend: 227, game: 152, domain: 149, backend: 136, tooling: 76, database: 46, shared: 45, docs: 21, tests: 19, api: 10, infrastructure: 8, other: 1 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | not measured | 78.9% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 7 | 7 | held |
| functionShape.elseBlocks | 2 | 2 | held |
| duplication.duplicatedPercentage | None | 0.14 | — |
| comments.explanatoryCommentLines | 0 | 0 | held |
| magicValues.inlineHexColours | 0 | 0 | held |
| inventory.orphanComponents | 1 | 1 | held |
| orphans.orphanFunctions | None | 20 | — |
| prose.longMemberChainLines | 603 | 603 | held |
| prose.deeplyIndentedLines | 59 | 59 | held |
| functionNames.overlongFunctionNames | 4 | 4 | held |
| accessorNames.gluedAccessorNames | None | 4 | — |
| conditions.tangledConditionLines | None | 46 | — |
| conditions.literalComparisonLines | None | 207 | — |
| designPatterns.predictedFilesMissing | None | 0 | — |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
