// sqrt ( real ** 2 + imag ** 2 )
export const complexAbs = (real: number, imag: number): number => Math.hypot(real, imag);

export const complexAngle = (real: number, imag: number): number => Math.atan(imag / real);
