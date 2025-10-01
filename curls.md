#!/bin/bash

echo "===> Crear Cliente"
curl -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"username":"juan_cliente","password":"password123","role":"cliente"}'
echo -e "\n"

echo "===> Crear Soporte"
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"username":"maria_soporte","password":"password456","role":"soporte"}'
echo -e "\n"

echo "===> Crear Admin"
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"username":"pedro_admin","password":"password789","role":"admin"}'
echo -e "\n"

echo "===> Listar usuarios"
curl http://localhost:4000/users
echo -e "\n"

echo "===> Cliente crea solicitud"
curl -X POST http://localhost:4000/requests -H "Content-Type: application/json" -d '{"user_id":1,"title":"Problema con login","description":"No puedo entrar a la plataforma"}'
echo -e "\n"

echo "===> Cliente consulta sus solicitudes"
curl "http://localhost:4000/requests?user_id=1&role=cliente"
echo -e "\n"

echo "===> Soporte consulta todas las solicitudes"
curl "http://localhost:4000/requests?role=soporte"
echo -e "\n"

echo "===> Soporte actualiza estado y respuesta"
curl -X PUT http://localhost:4000/requests/1 -H "Content-Type: application/json" -d '{"status":"resuelto","response":"Se restableció tu cuenta"}'
echo -e "\n"

echo "===> Admin consulta todas las solicitudes"
curl "http://localhost:4000/requests?role=admin"
echo -e "\n"