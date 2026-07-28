---
name: frontend-clean-architecture
description:
  Garantiza que toda creación o modificación de código en front-zarken (React + Vite + TypeScript +
  React Query) respete la clean architecture ya establecida: capas domain (entidades + puertos),
  application (casos de uso), infrastructure (HTTP + localStorage) y presentation (React), cableadas
  en src/di/container.ts. Las páginas solo consumen hooks, los hooks consumen puertos vía el
  contenedor, y nada de fetch, rutas del backend ni localStorage fuera de infrastructure. Debe
  seguirse SIEMPRE al agregar endpoints, features, hooks, páginas o al refactorizar el frontend.
tools: Read, Edit, Write, MultiEdit, Grep, Glob, Bash
---

# Frontend Clean Architecture Skill

## Objetivo

Actuar como un Senior Frontend Architect y mantener la **clean architecture** del frontend
(`front-zarken/`) tal como quedó establecida. El diagrama y la explicación completa viven en
`front-zarken/docs/arquitectura.md` — leerlo ante cualquier duda.

Este skill debe activarse SIEMPRE que se vaya a:

- Agregar o modificar un endpoint consumido por el frontend
- Crear una feature, página, hook o provider nuevo
- Refactorizar código existente de `front-zarken/src`
- Tocar autenticación, sesión o persistencia local

## Mapa de capas y regla de dependencias

```
presentation → application → domain ← infrastructure
                    ↑ ambas cableadas en di/container.ts
```

| Capa | Carpeta | Qué contiene | Qué tiene PROHIBIDO |
|---|---|---|---|
| domain | `src/domain/` | Entidades por agregado (`entities/`), puertos (`repositories/`, interfaces + tipos de input), `errors.ts` (`ApiError`) | Importar de cualquier otra capa; conocer React, HTTP, localStorage |
| application | `src/application/` | Casos de uso con orquestación real (`session/sessionService.ts`), puertos de storage (`ports/`) | Importar infrastructure, presentation o di |
| infrastructure | `src/infrastructure/` | `http/httpClient.ts` (fetch, X-API-KEY, Bearer, normaliza a `ApiError`), `repositories/http*Repository.ts` (rutas del backend), `storage/local*.ts` | Importar presentation o di |
| di | `src/di/container.ts` | Raíz de composición: única que conoce implementaciones concretas y `import.meta.env` | — |
| presentation | `src/presentation/` | `app/` (App, router, providers, guards, queryClient), `features/*` (páginas + hooks React Query), `design-system/`, `lib/` | fetch, rutas del backend, localStorage, `import.meta.env` |

## Recetas

### Agregar un endpoint nuevo

1. **Puerto**: agregar el método a la interfaz en `src/domain/repositories/<agregado>Repository.ts`,
   con su tipo de input (`CreateXInput`, `UpdateXInput`) en el mismo archivo. Si la entidad es
   nueva, crearla en `src/domain/entities/<agregado>.ts` y exportarla desde `entities/index.ts`.
2. **Adaptador**: implementarlo en `src/infrastructure/repositories/http<Agregado>Repository.ts`
   usando el `HttpClient`. Las rutas del backend SOLO viven acá.
3. **Hook**: exponerlo en `src/presentation/features/<feature>/use<Feature>.ts` con React Query
   (queryKey consistente con las existentes, invalidaciones en `onSuccess`). El hook aporta
   `companyId`/`branchId` activos con `Omit<Input, 'companyId' | 'branchId'>` cuando corresponda.
4. **Página**: consume solo hooks. Nunca el contenedor ni repositorios directo.

### Agregar una feature nueva

- Carpeta `src/presentation/features/<feature>/` con páginas + hooks.
- Puerto + entidades en domain, implementación en infrastructure, registro en `di/container.ts`.
- Ruta en `src/presentation/app/router.tsx`; permisos con `<Can>` (tipo `Permission` en domain).
- Diagrama Mermaid del flujo para el manual (convención del proyecto) y, si trae catálogo nuevo,
  su seed SQL.
- Tutorial guiado: agregar/actualizar el recorrido que cubre la feature (ver sección
  "Tutoriales guiados").

### Tutoriales guiados

El sistema tiene tutoriales in-app (spotlight + tarjeta paso a paso) que guían al usuario por las
capacidades del sistema. Viven en `src/presentation/features/tutorial/` y están documentados con
su diagrama en `front-zarken/docs/tutoriales.md`.

- **Definiciones**: `tutorials.ts` — cada tutorial tiene `id`, `title`, `description`,
  `permission?` y `steps`. Cada paso: `target?` (ancla), `route?` (navega antes de mostrarlo),
  `permission?` (filtra el paso), `title` y `body`. Textos SIEMPRE en español (voseo es-AR).
- **Anclas**: atributo `data-tutorial="<target>"` en el elemento a resaltar. Convención:
  `nav-<sección>` para el menú lateral, `<página>-<elemento>` para elementos de página
  (`pos-buscador`, `pos-ticket`). Si el ancla no existe, el paso cae a tarjeta centrada — nunca
  romper el tutorial por un elemento condicional.
- **Estado y persistencia**: `TutorialContext.tsx` (provider montado en `AppShell`). La marca de
  visto (`completado`/`omitido`) se guarda vía el puerto `KeyValueStorage`
  (`container.preferences`), clave `zarken.tutorial.<id>`. NO usar `localStorage` directo.
- **UI**: `TutorialOverlay.tsx` (spotlight) y `TutorialMenu.tsx` (menú "Ayuda" del header, lista
  los tutoriales filtrados por permisos y permite repetirlos).
- **Al agregar una feature con página nueva**: sumar su paso al recorrido `bienvenida`
  (apuntando a `nav-<sección>`, con su `permission`) y, si el flujo es complejo (varios pasos en
  la página), crear un tutorial dedicado con anclas propias.

### Lógica nueva

- ¿Orquesta más de un puerto o maneja estado persistido (como la sesión)? → caso de uso en
  `application/` (factory `create<X>Service(deps)` que recibe puertos, nunca implementaciones).
- ¿Es CRUD directo? → el puerto del repositorio ES el contrato; NO crear casos de uso passthrough.
- ¿Es derivación para la UI (memos, labels, formato)? → hook o `presentation/lib/`.

## Convenciones

- Carpetas kebab-case, archivos camelCase (`useProducts.ts`, `httpSaleRepository.ts`).
- Factories, no clases: `createXRepository(http)`, `createXService(deps)`.
- Errores: solo `ApiError` (de `@/domain/errors`) cruza capas; las páginas hacen
  `err instanceof ApiError ? err.message : fallback`. Mensajes al usuario en español (voseo es-AR).
- Tipos que una página necesita se re-exportan desde el hook (`export type { CreateSaleInput }`),
  no se importan de domain en las páginas.
- Comentarios en español, breves, solo para restricciones no evidentes (estilo del código actual).
- Estados de carga descriptivos con los primitivos de `design-system/feedback.tsx`.

## Checklist antes de dar por terminado

1. `grep` de violaciones: sin `fetch`, `localStorage` ni `import.meta.env` fuera de
   `infrastructure/` y `di/`; sin `@/infrastructure` ni `@/di` en domain/application; sin
   `@/presentation` fuera de presentation.
2. `npm run lint` (typecheck) y `npm run build` en `front-zarken/` en verde.
3. Si cambió la arquitectura (capa, puerto o flujo nuevo), actualizar
   `front-zarken/docs/arquitectura.md` y su diagrama Mermaid.
