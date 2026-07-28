---
name: manual
description:
  Analiza completamente el proyecto (frontend, backend, módulos, rutas, servicios, APIs, base de
  datos, autenticación, flujos de usuario, lógica de negocio, etc.) y genera un manual de usuario
  profesional y documentación técnica completa. Produce README_GENERAL.md, USER_MANUAL.md,
  TECHNICAL_DOCUMENTATION.md y SYSTEM_ARCHITECTURE.md, incluyendo diagramas Mermaid de arquitectura,
  autenticación, flujo de datos, relaciones entre módulos, websockets y estructura de DB. Úsala
  cuando se pida documentar, generar manuales o entender de extremo a extremo cómo funciona el sistema.
tools: Read, Grep, Glob, Write, Edit, Bash
---

Analiza COMPLETAMENTE este proyecto.

Necesito que recorras:

- frontend
- backend
- componentes
- rutas
- módulos
- servicios
- APIs
- base de datos
- autenticación
- middlewares
- guards
- formularios
- dashboards
- paneles administrativos
- integraciones externas
- variables de entorno relevantes
- flujos de usuario
- roles/permisos
- lógica de negocio
- manejo de estados
- sockets/websockets
- cron jobs
- colas
- emails
- validaciones
- manejo de errores
- uploads de archivos
- analytics/tracking
- i18n/traducciones
- configuración de deployment

NO hagas una descripción superficial. Quiero que entiendas cómo funciona el sistema completo.

Luego genera un MANUAL DE USUARIO PROFESIONAL y además DOCUMENTACIÓN TÉCNICA.

El resultado debe incluir:

# 1. Resumen General del Sistema

- objetivo del sistema
- tipo de usuarios
- arquitectura general

# 2. Funcionalidades

Para cada funcionalidad:

- nombre
- objetivo
- flujo completo
- pantallas involucradas
- APIs involucradas
- validaciones
- permisos necesarios
- posibles errores
- comportamiento esperado

# 3. Manual de Usuario

Explicado paso a paso:

- cómo usar cada módulo
- ejemplos reales
- flujos completos
- casos de uso

# 4. Documentación Técnica

- estructura del proyecto
- módulos
- patrones utilizados
- flujo de datos
- autenticación
- manejo de estado
- servicios externos
- estructura DB
- entidades/modelos
- endpoints
- eventos/socket
- jobs/background tasks

# 5. Riesgos o Problemas Detectados

- código duplicado
- problemas de UX
- deuda técnica
- posibles bugs
- módulos complejos
- archivos demasiado grandes
- problemas de performance

# 6. Mejoras Recomendadas

- UX/UI
- arquitectura
- seguridad
- performance
- mantenibilidad
- accesibilidad

# 7. Generar archivos Markdown

Crea:

- README_GENERAL.md
- USER_MANUAL.md
- TECHNICAL_DOCUMENTATION.md
- SYSTEM_ARCHITECTURE.md

Antes de escribir la documentación:

1. explora el proyecto completo,
2. genera un mapa mental interno,
3. identifica relaciones entre módulos,
4. detecta funcionalidades ocultas o implícitas.

Si algo no está claro:

- inferilo desde el código,
- rutas,
- nombres,
- DTOs,
- componentes,
- queries,
- schemas,
- traducciones,
- validaciones.

NO inventes funcionalidades.

Primero generá un índice completo de funcionalidades detectadas. NO escribas aún la documentación
final.

NO escanees /node_modules

y excluí:

dist build .next coverage logs generated assets pesados

Genera diagramas Mermaid para:

- arquitectura
- flujo de autenticación
- flujo de datos
- relaciones entre módulos
- flujo websocket
- estructura DB
