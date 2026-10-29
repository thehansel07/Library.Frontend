# Library - frontend

Esta es la parte de Angular de la prueba técnica. Permite consultar libros, ver su detalle y manejar los autores asociados. Las altas, ediciones y eliminaciones pasan por la API .NET.

Se usa Angular 21 con Angular Material 21. Los formularios son reactivos y las páginas de libros y autores se cargan al entrar en sus rutas.

## Para ejecutarlo

Necesitas Node 22.13.1 o superior de la rama 22, o Node 24, y npm 10 o superior. El archivo `.nvmrc` tiene la versión usada en desarrollo. Si tienes nvm:

```powershell
nvm use 22.13.1
node --version
```

Las URLs de repositorio son de ejemplo; hay que reemplazarlas por las reales:

```bash
git clone https://github.com/tu-organizacion/library-backend.git
git clone https://github.com/tu-organizacion/library-frontend.git
```

En esta entrega están separados en `BACKEND/Library` y `FRONTEND/Library`.

Primero hay que levantar el backend. Desde su carpeta:

```powershell
dotnet restore Library.slnx
dotnet run --project Api/Api.csproj --launch-profile Library
```

Este perfil usa `https://localhost:5001` y `http://localhost:4848`. Swagger está en `https://localhost:5001/swagger`.

Si hay un problema con el certificado local:

```powershell
dotnet dev-certs https --trust
```

Después, desde la carpeta del frontend y en otra terminal:

```powershell
npm ci
npm start
```

Abrir [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Conexión con la API

La aplicación llama a `/api/v1`. En desarrollo, `proxy.conf.cjs` reenvía esas peticiones a `https://localhost:5001`.

Si el backend está usando el perfil `http`, que corre en el puerto 5296, hay que indicar ese destino antes de arrancar Angular:

```powershell
$env:LIBRARY_API_URL = "http://localhost:5296"
npm start
```

La variable solo afecta al proxy de desarrollo. El ajuste `secure: false` permite usar el certificado autofirmado local en esa conexión.

La URL base de las llamadas está centralizada en `src/environments/environment.ts`, mediante `API_BASE_URL`. `BookService` y `AuthorService` usan HttpClient y tienen los métodos para listar, consultar por id, crear, actualizar y eliminar.

## Cómo quedó organizado

```text
src/app/
├── Books/
│   ├── models/
│   ├── services/book.service.ts
│   ├── pages/                    Listado, detalle y formulario
│   └── books.routes.ts
├── Authors/
│   ├── models/
│   ├── services/author.service.ts
│   ├── pages/                    Listado y formulario
│   └── authors.routes.ts
├── Shared/
│   ├── api/                      URL base y mensajes de error
│   ├── data/                     Estado del catálogo durante la sesión
│   ├── layout/                   Navegación y contenedor de las páginas
│   └── ui/                       Confirmación, estados vacíos y portada
├── app.config.ts
└── app.routes.ts
```

Los componentes son standalone. `app.routes.ts` carga las rutas de cada sección con `loadChildren` y cada página usa `loadComponent`. El estado del catálogo se comparte desde servicios de raíz para conservar los cambios al pasar de libros a autores.

## Pantallas

| Ruta | Qué muestra |
| --- | --- |
| `/books` | Libros con búsqueda, ordenación y paginación |
| `/books/new` | Formulario para agregar un libro |
| `/books/:id` | Detalle del libro y sus autores |
| `/books/:id/edit` | Formulario de edición |
| `/authors` | Autores, libros asociados y acciones |
| `/authors/new` | Formulario para agregar un autor |
| `/authors/:id/edit` | Formulario de edición del autor |

Antes de eliminar se pide confirmación. Los formularios validan los datos obligatorios y los valores numéricos. Si falla una llamada, se muestra el error y se conserva el estado anterior. Los errores de carga permiten reintentar.

Las fuentes y los iconos se sirven desde el proyecto. Las portadas son decorativas: el contrato de libros no devuelve una imagen.

## Sobre los cambios del catálogo

Hay un detalle importante con FakeRestAPI: puede responder correctamente a una escritura sin persistirla.

Después de recibir una respuesta exitosa, el frontend conserva el cambio en memoria. Puedes navegar entre secciones y usar el botón de actualizar sin perderlo. **Al recargar la pestaña, esos cambios se descartan.**

Esto también significa que un error de la API no se trata como una operación exitosa. Los datos que se muestran vienen del backend; no se reemplazan por un catálogo local.

Los logs agregados al listado y al servicio de libros están limitados al modo de desarrollo.

### Autores y cantidad de libros

La relación que ofrece la API es `Author.idBook → Book.id`. Cada fila corresponde a una ficha de autor vinculada con un libro.

Para mostrar la cantidad de libros se reúnen los identificadores de libro distintos de las fichas que comparten nombre y apellido. Es una aproximación: dos personas distintas podrían tener el mismo nombre. Editar o eliminar afecta a la ficha seleccionada, no a todas las coincidencias.

## Compilar y probar

```powershell
npm run build
npm test
```

El build queda en `dist/library/browser`. Las pruebas usan Jasmine y Karma con un navegador Chromium en modo headless.

Si en Windows se usa Edge para correr las pruebas:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm test
```

La última ejecución pasó las 12 pruebas. Cubren navegación, llamadas HTTP, cambios de sesión, conteo de libros, cancelación y errores al eliminar, paginación y la fecha de publicación en UTC.

También se comprobaron las altas y ediciones contra el backend local y las vistas en escritorio y móvil. La compilación de producción terminó correctamente.

Para aplicar el formato del proyecto:

```powershell
npm run format
```

## Si npm falla por un certificado

En una red con certificado corporativo, npm puede mostrar `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. En ese caso hay que configurar `NODE_EXTRA_CA_CERTS` con el PEM de la cadena de confianza de la organización antes de instalar los paquetes.

Con Node 24 también se puede usar `NODE_USE_SYSTEM_CA=1` para tomar los certificados del sistema. No hace falta desactivar `strict-ssl`.

## Para publicarlo

Ejecutar `npm ci` y `npm run build`, y servir el contenido de `dist/library/browser` con Nginx, IIS o un hosting estático.

El servidor debe devolver `index.html` al abrir una ruta de la SPA, como `/books/1`. Además, debe reenviar `/api/` al backend.

Un ejemplo de enrutamiento con Nginx sería:

```nginx
server {
    listen 80;
    root /var/www/library;
    index index.html;

    location /api/ {
        proxy_pass https://library-api.example.com;
        proxy_ssl_server_name on;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

El dominio y la carpeta son de ejemplo. Para el despliegue real hay que configurar HTTPS.

Si el frontend y la API quedan en orígenes distintos, cambiar `apiBaseUrl` al origen HTTPS de la API, volver a compilar y configurar el origen del frontend en CORS del backend.

Por ahora el proyecto está verificado en local; no se ha publicado en un servicio externo.
