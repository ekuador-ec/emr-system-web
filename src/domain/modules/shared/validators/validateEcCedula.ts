/**
 * Validates an Ecuadorian cédula (national ID) using the Módulo 10 algorithm.
 *
 * Checks:
 * 1. Exactly 10 digits
 * 2. Province code (first 2 digits) between 01 and 24
 * 3. Third digit between 0 and 5 (persona natural)
 * 4. Check digit (10th digit) matches Módulo 10 calculation
 *
 * This mirrors the PostgreSQL `validate_ec_cedula()` function
 * to provide frontend validation before hitting the database.
 */
export function validateEcCedula(cedula: string): boolean {
  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Province code: 01–24
  const province = Number.parseInt(cedula.substring(0, 2), 10);
  if (province < 1 || province > 24) {
    return false;
  }

  // Third digit: 0–5
  const third = Number.parseInt(cedula[2], 10);
  if (third >= 6) {
    return false;
  }

  // Módulo 10 check
  const digits = cedula.split("").map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let value = digits[i];

    if (i % 2 === 0) {
      value *= 2;
      if (value > 9) {
        value -= 9;
      }
    }

    sum += value;
  }

  const verifier = (10 - (sum % 10)) % 10;

  return verifier === digits[9];
}
