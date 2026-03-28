/**
 * Remove internal markers from Claude's response before displaying.
 * Handles both complete and partial (still streaming) blocks.
 */
export function cleanDisplayText(text: string): string {
  let cleaned = text;

  // 1. Remove complete ```state_update ... ``` blocks
  cleaned = cleaned.replace(/```state_update\s*[\s\S]*?```/g, '');

  // 2. Remove partial state_update block (streaming — not yet closed)
  //    Matches ```state_update followed by anything to end of string (no closing ```)
  cleaned = cleaned.replace(/```state_update[\s\S]*$/g, '');

  // 3. Remove [CHECKPOINT] markers
  cleaned = cleaned.replace(/\[CHECKPOINT\]/g, '');

  // 4. Remove any leftover empty code fences from state blocks
  cleaned = cleaned.replace(/```\s*```/g, '');

  // 5. Collapse excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Format a number as Turkish Lira
 */
export function formatTL(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as USD
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get badge class for karar
 */
export function kararBadgeClass(karar: string): string {
  switch (karar) {
    case 'GO':
      return 'fab-badge-go';
    case 'CONDITIONAL GO':
      return 'fab-badge-conditional';
    case 'NO-GO':
      return 'fab-badge-nogo';
    default:
      return 'fab-badge-module';
  }
}
