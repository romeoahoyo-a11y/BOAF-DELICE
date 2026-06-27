import { Actor, PromoCode } from '../types';

export interface ParsedPromoResult {
  code_complet: string | null;
  numero_code: string | null;
  nom_client: string;
  matchedPromoCode: PromoCode | null;
  has_code_error: boolean;
  code_error_type: string | undefined;
}

/**
 * Parses a client name string to extract any embedded promo code or suffix number,
 * then queries the DB to find the matching active promo code.
 */
export function parseClientNameAndPromo(
  clientName: string,
  promoCodes: PromoCode[],
  actors: Actor[]
): ParsedPromoResult {
  let code_complet: string | null = null;
  let numero_code: string | null = null;
  let nom_client: string = clientName;

  // 1. Look for complete code formats like BOAF-AMB-001 or AMB-001
  const completeCodeMatch = clientName.match(/\b(BOAF-[A-Z]+-\d+)\b/i) || clientName.match(/\b([A-Z]+-\d+)\b/i);
  if (completeCodeMatch) {
    code_complet = completeCodeMatch[1];
    const numMatch = code_complet.match(/\d+$/);
    if (numMatch) {
      numero_code = numMatch[0];
    }
    // Remove the code and leading/trailing dashes/spaces
    nom_client = clientName.replace(completeCodeMatch[0], '').replace(/^\s*[-–—]\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();
  } else {
    // 2. No complete code found. Look for "code 001" or "boaf 001" or leading "001"
    const prefixMatch = clientName.match(/\b(?:code|boaf)\s+(\d+)\b/i);
    if (prefixMatch) {
      numero_code = prefixMatch[1];
      nom_client = clientName.replace(/\b(?:code|boaf)\s+\d+/i, '').replace(/^\s*[-–—]\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();
    } else {
      const leadingNumberMatch = clientName.match(/^\s*(\d+)\b/);
      if (leadingNumberMatch) {
        numero_code = leadingNumberMatch[1];
        nom_client = clientName.replace(/^\s*\d+/, '').replace(/^\s*[-–—]\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();
      }
    }
  }

  // Fallback to avoid empty name
  if (!nom_client || nom_client.trim() === '') {
    nom_client = clientName;
  }

  let matchedPromoCode: PromoCode | null = null;
  let has_code_error = false;
  let code_error_type: string | undefined = undefined;

  if (numero_code) {
    const targetNumVal = parseInt(numero_code, 10);
    
    // Search active promo codes by matching numeric suffix
    matchedPromoCode = promoCodes.find(pc => {
      if (pc.status !== 'active') return false;
      const suffixMatch = pc.code.match(/\d+$/);
      return suffixMatch && parseInt(suffixMatch[0], 10) === targetNumVal;
    }) || null;

    // If not found in active promo codes, search in active actors' main_code suffix
    if (!matchedPromoCode) {
      const matchedActor = actors.find(a => {
        if (a.status !== 'active') return false;
        const mainCode = a.main_code || '';
        const suffixMatch = mainCode.match(/\d+$/);
        return suffixMatch && parseInt(suffixMatch[0], 10) === targetNumVal;
      });

      if (matchedActor) {
        // Find existing active promo code for this actor
        const existingPC = promoCodes.find(pc => pc.actor_id === matchedActor.id && pc.status === 'active');
        if (existingPC) {
          matchedPromoCode = existingPC;
        } else {
          // Fallback/virtual promo code for commission tracking
          matchedPromoCode = {
            id: `code-temp-${matchedActor.id}`,
            code: matchedActor.main_code || `BOAF-${matchedActor.id}`,
            type_code: 'BOAF-TEMP',
            actor_id: matchedActor.id,
            status: 'active',
            starts_at: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString().split('T')[0]
          };
        }
      }
    }

    // If a code suffix was parsed but no beneficiary could be matched
    if (!matchedPromoCode) {
      has_code_error = true;
      code_error_type = 'code_inconnu';
    }
  }

  return {
    code_complet,
    numero_code,
    nom_client,
    matchedPromoCode,
    has_code_error,
    code_error_type
  };
}
