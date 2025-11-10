export function generateOtp(length = 6): string {
    const min = 10 ** (length - 1);
    return Math.floor(min + Math.random() * 9 * min).toString();
  }
  