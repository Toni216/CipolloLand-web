/**
 * Comprueba si una fecha está dentro de una ventana de horas desde ahora.
 * Vive en su propio módulo (no dentro de un componente) para evitar que
 * el linter marque `Date.now()` como una llamada impura durante el render.
 */
export function esReciente(fecha: Date, horas: number = 48): boolean {
  return (Date.now() - fecha.getTime()) < horas * 60 * 60 * 1000
}