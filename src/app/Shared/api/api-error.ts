import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un problema inesperado. Inténtalo de nuevo.';
  }

  switch (error.status) {
    case 0:
      return 'No pudimos conectar con la API. Comprueba que el Backend esté en ejecución.';
    case 400:
      return 'Revisa los datos del formulario. La API no pudo procesarlos.';
    case 404:
      return 'El registro que buscas ya no está disponible.';
    case 502:
    case 503:
      return 'El servicio de libros no está disponible por el momento. Inténtalo en unos minutos.';
    case 504:
      return 'El servicio está tardando más de lo habitual. Vuelve a intentarlo.';
    default:
      return 'No pudimos completar la operación. Inténtalo de nuevo.';
  }
}
