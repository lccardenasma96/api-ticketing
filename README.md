# Sistema de Solicitudes - Tutorial y Documentación

## Visión general
- **Tecnologías**: Node.js, Express, SQLite.
- **Arquitectura**: servidor Express con rutas separadas para `auth`, `users` y `requests`. SQLite como base de datos embebida.
- **Roles soportados**: `cliente`, `soporte`, `admin`.

## Estructura del proyecto
- `src/app.js`: Servidor y middlewares; monta CORS y JSON, registra rutas.
- `src/db.js`: Conexión SQLite y creación de tablas `users` y `requests`.
- `src/routes/auth.js`: Ruta de "login" (crea usuario).
- `src/routes/users.js`: Listado de usuarios.
- `src/routes/requests.js`: CRUD básico de solicitudes (crear, listar, actualizar).

## Modelos de datos
- **users**
  - `id`: INTEGER, autoincremental
  - `name`: TEXT
  - `role`: TEXT (`cliente` | `soporte` | `admin`) obligatorio
- **requests**
  - `id`: INTEGER, autoincremental
  - `user_id`: INTEGER (FK a `users.id`)
  - `title`: TEXT
  - `description`: TEXT
  - `status`: TEXT, por defecto `pendiente`
  - `response`: TEXT (opcional)

## Endpoints

### Autenticación (login simple que crea usuario)
- Método: POST `/auth/login`
- Body JSON: `{ "name": "Ana", "role": "cliente" }`
- Respuesta: `{ id, name, role }`

### Usuarios
- Método: GET `/users`
- Respuesta: lista de todos los usuarios

### Solicitudes (requests)
- POST `/requests`: crea solicitud. Body: `{ user_id, title, description }`
- GET `/requests`: lista solicitudes
  - Si `role=cliente`, exige `user_id` y filtra por ese usuario
  - Si `role=soporte` o `role=admin`, devuelve todas
- PUT `/requests/:id`: actualiza `status` y `response`

## Cómo ejecutar el proyecto
1. Instala dependencias:
```bash
npm install
```
2. Variables de entorno (opcional): crea `.env` si quieres cambiar el puerto:
```bash
PORT=5000
```
3. Ejecuta el servidor:
```bash
npm start
```
4. Verifica en consola: "Servidor corriendo en puerto 4000" (o el que definas).

## Probar con ejemplos (cURL / Postman)

> Los ejemplos a continuación están formateados para PowerShell (Windows) con `^` como continuación de línea.

- Crear usuario (login)
```bash
curl -X POST http://localhost:4000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ana\",\"role\":\"cliente\"}"
```

- Listar usuarios
```bash
curl http://localhost:4000/users
```

- Crear solicitud
```bash
curl -X POST http://localhost:4000/requests ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\":1,\"title\":\"Problema X\",\"description\":\"Detalle del problema\"}"
```

- Listar solicitudes como cliente (solo las suyas)
```bash
curl "http://localhost:4000/requests?role=cliente&user_id=1"
```

- Listar solicitudes como soporte/admin (todas)
```bash
curl "http://localhost:4000/requests?role=soporte"
```

- Actualizar solicitud (respuesta y estado)
```bash
curl -X PUT http://localhost:4000/requests/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"resuelta\",\"response\":\"Solución aplicada\"}"
```

## Flujo típico de uso
1. Un usuario “inicia sesión” vía `/auth/login` (se crea un registro en `users`).
2. Un cliente crea solicitudes en `/requests` con su `user_id`.
3. Soporte/Admin consulta todas las solicitudes; Cliente solo ve las suyas.
4. Soporte/Admin actualiza `status` y `response` en `/requests/:id`.

## Consideraciones y mejores prácticas
- **Validación**: actualmente no hay validación de payload. Agregar checks para `name`, `role`, `title`, `description`, `status`.
- **Autenticación real**: el “login” actual solo crea usuarios. Para producción, usar JWT, contraseñas, y control de acceso por rol.
- **Índices y FK**: considerar índice en `requests.user_id`. Activar `PRAGMA foreign_keys = ON` si fuera necesario.
- **Estados**: estandarizar `status` (ej.: `pendiente`, `en_proceso`, `resuelta`, `cerrada`) con un CHECK.
- **Paginación**: añadir `limit/offset` en `GET /requests` para grandes volúmenes.
- **Errores**: unificar formato de errores y logs.

## Cómo extender
- Agregar `GET /requests/:id` para ver detalle.
- Añadir borrado suave de solicitudes (`deleted_at`) en lugar de `DELETE`.
- Filtrar por `status` y ordenar por fecha de creación.
- Implementar middleware de autorización por rol.

### Ejemplo de filtro por estado (idea de consulta SQL)
```sql
SELECT * FROM requests
WHERE (/* si role = 'cliente' */ user_id = ? OR 1=1)
AND (status = ? OR ? IS NULL)
ORDER BY id DESC
LIMIT ? OFFSET ?;
``` 