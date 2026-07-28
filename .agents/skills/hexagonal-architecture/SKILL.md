---
name: hexagonal-architecture
description:
  Garantiza que toda creación o modificación de código en este backend NestJS respete estrictamente
  la arquitectura hexagonal (Ports & Adapters) ya establecida en el proyecto. Aplica capas Domain,
  Application e Infrastructure con sus dependencias en el sentido correcto, usa Symbols para
  inyección por interfaz, separa modelos de dominio (BaseModel) de entidades TypeORM, mantiene
  controladores delgados, repositorios como adaptadores, y respeta las convenciones de naming del
  proyecto. También debe seguirse al modificar módulos existentes o al planear nuevas features.
tools: Read, Edit, Write, MultiEdit, Grep, Glob, Bash
---

# Hexagonal Architecture Skill

## Objetivo

Actuar como un Senior Backend Architect especializado en **Arquitectura Hexagonal (Ports &
Adapters)** aplicada sobre NestJS + TypeORM.

Este skill debe activarse SIEMPRE que se vaya a:

- Crear un nuevo módulo / feature / entidad
- Modificar código existente en cualquier capa
- Agregar un endpoint, caso de uso, servicio o repositorio
- Refactorizar lógica de negocio
- Integrar una librería externa (HTTP, queue, mailer, storage, etc.)
- Conectar con base de datos
- Definir DTOs, modelos, types, interfaces o entidades

El objetivo es que **toda nueva línea de código respete la estructura existente** descrita en
[src/user/](src/user/), [src/catalogs/](src/catalogs/) y replicada por
[scripts/generate-structure.sh](scripts/generate-structure.sh).

---

# Reglas Fundamentales

## NO HACER

- NO importar nada de `infrastructure/*` desde `domain/*` ni desde `application/*`
- NO importar `@nestjs/*`, `typeorm`, `bcrypt`, `axios`, etc. dentro de `domain/*`
- NO usar decoradores (`@Injectable`, `@Entity`, `@Column`, `@ApiProperty`, etc.) dentro de
  `domain/*`
- NO inyectar repositorios concretos: SIEMPRE inyectar por `Symbol.for(...)` apuntando a la
  interfaz
- NO devolver entidades TypeORM desde controladores ni servicios; devolver siempre `Model.hydrate()`
- NO poner lógica de negocio en controladores ni en repositorios
- NO poner llamadas a `this.xxxRepository.save(...)` o queries en application/services
- NO mezclar DTOs (capa nest) con Types del dominio
- NO crear nuevos módulos sin su `symbols-<modulo>.ts` y su `custom-provider.ts`
- NO registrar providers como clase directa en `@Module({ providers: [XxxService] })`; debe
  registrarse con el objeto `{ provide: Symbols.IXxxService, useClass: XxxService }`
- NO crear archivos sueltos fuera de la estructura `application/`, `domain/`, `infrastructure/`
- NO duplicar entidades TypeORM: la entidad real vive en
  `src/core/infrastructure/typeorm/entities/<schema>/`, el módulo solo la extiende
- NO usar `any` salvo en `create()` / `hydrate()` (es la convención existente)

---

# Estructura Canónica de un Módulo

Cualquier módulo nuevo (no catálogo) DEBE tener la siguiente forma, idéntica a [src/user/](src/user/):

```
src/<modulo>/
├── <modulo>.module.ts
├── symbols-<modulo>.ts
├── application/
│   ├── constants/                       # constantes de negocio (opcional)
│   └── services/
│       └── <modulo>.service.ts          # caso de uso → implementa I<Modulo>Service
├── domain/
│   ├── models/
│   │   └── <modulo>.model.ts            # extiende BaseModel, create() + hydrate() + toJSON()
│   ├── repositories/
│   │   └── <modulo>.interface.repository.ts
│   ├── services/
│   │   └── <modulo>.interface.service.ts
│   └── types/
│       └── <modulo>.types.ts            # ICreate<Modulo>, IUpdate<Modulo>, etc.
└── infrastructure/
    ├── constants/
    │   └── custom-provider.ts           # bindea Symbol → useClass
    ├── nest/
    │   ├── controllers/
    │   │   └── <modulo>.controller.ts
    │   └── dtos/
    │       └── <modulo>.dto.ts
    └── typeorm/
        ├── entities/
        │   └── <modulo>.entity.ts       # extends Core<Modulo> de src/core/...
        └── repositories/
            └── <modulo>.repository.ts   # implementa I<Modulo>Repository
```

Para **catálogos**, todo vive bajo `src/catalogs/` y se agrega al `catalogs.module.ts`,
`symbols-catalogs.ts` y `infrastructure/constants/custom-provider.ts` existentes. El prefijo de
clase es `Cat<Nombre>` (ej. `CatRoleModel`, `CatRoleRepository`).

> Cuando corresponda crear un módulo nuevo, **preferir ejecutar**
> [scripts/generate-structure.sh](scripts/generate-structure.sh) en lugar de crear archivos a mano:
>
> - Módulo normal: `./scripts/generate-structure.sh <nombre>`
> - Catálogo: `./scripts/generate-structure.sh <nombre> --catalog`

---

# Reglas por Capa

## 1. Domain (`src/<modulo>/domain/`)

Es la capa más interna. NO conoce NestJS, NO conoce TypeORM, NO conoce HTTP.

### `domain/models/<modulo>.model.ts`

- Extiende `BaseModel` de [src/core/domain/models/base.model.ts](src/core/domain/models/base.model.ts)
- Atributos privados con `_` (ej. `_email`, `_isActive`)
- Métodos `static create(obj): Model` y `static hydrate(obj): Model`
  - `create` se usa para construir un agregado nuevo (sin id o con id opcional)
  - `hydrate` se usa para reconstruir desde persistencia (siempre con id)
- Método `toJSON()` que controla qué se expone
- Métodos de negocio (`addRole`, `deactivate`, `changePassword`, etc.) viven aquí
- Usa `Identifier` de
  [src/core/domain/value-objects/identifier.ts](src/core/domain/value-objects/identifier.ts) como
  id

### `domain/repositories/<modulo>.interface.repository.ts`

- Solo la **interfaz** `I<Modulo>Repository`
- Firma siempre en términos del Model, NUNCA de la entidad TypeORM
- Métodos típicos: `persist`, `findById`, `findAll`, `getBy<Campo>`, `update`, `delete`

### `domain/services/<modulo>.interface.service.ts`

- Interfaz del caso de uso `I<Modulo>Service`
- Firma con types del dominio (`ICreate<Modulo>`, `IUpdate<Modulo>`) y Models

### `domain/types/<modulo>.types.ts`

- Solo `interface` planos: `ICreate<Modulo>`, `IUpdate<Modulo>`, filtros, etc.
- Sin decoradores, sin clases

---

## 2. Application (`src/<modulo>/application/`)

Orquesta el dominio. Implementa los casos de uso.

### `application/services/<modulo>.service.ts`

- `@Injectable()` de NestJS está PERMITIDO (única dependencia de framework aquí)
- Implementa `I<Modulo>Service`
- Recibe **interfaces** por constructor, inyectadas con `@Inject(Symbols<Modulo>.IXxxRepository)`
- Coordina: validaciones de negocio, llamadas a repositorios, mapeo a Models, manejo de errores con
  `BaseErrorException`
- NUNCA accede a `Repository<Entity>` de TypeORM directamente
- NUNCA recibe ni devuelve entidades TypeORM
- Lanza `BaseErrorException` con `HttpStatus` para errores controlados

Patrón base:

```ts
@Injectable()
export class XxxService implements IXxxService {
  constructor(
    @Inject(SymbolsXxx.IXxxRepository) private readonly xxxRepository: IXxxRepository,
  ) {}

  async create(input: ICreateXxx): Promise<XxxModel> {
    try {
      // 1. invariantes / validaciones de negocio
      // 2. construir modelo
      const model = XxxModel.create(input);
      // 3. persistir vía interfaz
      return await this.xxxRepository.persist(model);
    } catch (error) {
      throw new BaseErrorException(error.message, error.statusCode);
    }
  }
}
```

---

## 3. Infrastructure (`src/<modulo>/infrastructure/`)

Adapta el mundo exterior al dominio. Es la **única** capa donde pueden vivir NestJS, TypeORM,
clientes HTTP, librerías de terceros, decoradores de Swagger, validadores, etc.

### `infrastructure/typeorm/entities/<modulo>.entity.ts`

- Extiende la entidad core de `src/core/infrastructure/typeorm/entities/<schema>/<modulo>.entity.ts`
- Schema = `public` (módulo normal) o `catalogs` (catálogo)
- La definición real de columnas / relaciones vive en `src/core/...` para poder usarse en
  migraciones y mantenerse desacoplada del módulo

### `infrastructure/typeorm/repositories/<modulo>.repository.ts`

- `@Injectable()` + `@InjectRepository(Entity)`
- Implementa `I<Modulo>Repository`
- Mapea SIEMPRE de Entity → Model con `Model.hydrate(entity)` antes de devolver
- Acepta SIEMPRE Models como entrada y construye la entidad con `new Entity(model)`
- Errores → `BaseErrorException`

### `infrastructure/nest/controllers/<modulo>.controller.ts`

- DELGADO: solo recibe request, delega al service, devuelve resultado
- Inyecta el service por `@Inject(SymbolsXxx.IXxxService)` con el tipo `IXxxService` (interfaz)
- Usa DTOs para `@Body`, `@Query`, `@Param`
- Decoradores de Swagger (`@ApiTags`, `@ApiBody`, `@ApiResponse`, `@ApiOperation`) + `@HttpCode`
  explícito
- Sin try/catch: los errores los maneja el `BaseErrorException` y filtros globales

### `infrastructure/nest/dtos/<modulo>.dto.ts`

- `class-validator` (`@IsString`, `@IsEmail`, `@IsOptional`, `@IsNotEmpty`, …)
- `@ApiProperty()` para Swagger
- Un DTO por operación (`Create<Modulo>DTO`, `Update<Modulo>DTO`, filtros, …)

### `infrastructure/constants/custom-provider.ts`

Cada provider declarado como objeto `{ provide, useClass }`:

```ts
export const xxxRepository = {
  provide: SymbolsXxx.IXxxRepository,
  useClass: XxxRepository,
};

export const xxxService = {
  provide: SymbolsXxx.IXxxService,
  useClass: XxxService,
};
```

---

## 4. Module raíz (`<modulo>.module.ts`)

```ts
@Module({
  controllers: [XxxController],
  imports: [TypeOrmModule.forFeature([XxxEntity, ...])],
  providers: [xxxRepository, xxxService, ...],
  exports: [],
})
export class XxxModule {}
```

Y registrarlo en [src/app.module.ts](src/app.module.ts).

---

## 5. Symbols (`symbols-<modulo>.ts`)

```ts
const SymbolsXxx = {
  IXxxRepository: Symbol.for('IXxxRepository'),
  IXxxService: Symbol.for('IXxxService'),
};
export default SymbolsXxx;
```

Para catálogos: agregar la entrada al `symbols-catalogs.ts` existente, no crear uno nuevo.

---

# Regla de Dirección de Dependencias

Solo se permite que las flechas apunten **hacia adentro**:

```
infrastructure ──► application ──► domain
       │                ▲             ▲
       └────────────────┴─────────────┘
                  (depende de interfaces, no de implementaciones)
```

Verificaciones rápidas antes de aceptar un cambio:

- `domain/**` no debe contener imports de `@nestjs`, `typeorm`, `bcrypt`, `axios`, `class-validator`,
  `@nestjs/swagger`
- `application/**` no debe importar nada de `infrastructure/**`
- `infrastructure/**` puede importar de `domain/**` y `application/**`, pero NO al revés
- Los `import` cruzados entre módulos deben hacerse siempre contra **interfaces**
  (`domain/repositories/*.interface.repository.ts`, `domain/services/*.interface.service.ts`,
  `symbols-*.ts`), nunca contra clases concretas

Si una propuesta rompe estas reglas, **rechazarla y proponer una versión correcta** antes de
escribir código.

---

# Convenciones de Naming

Idénticas a las de [scripts/generate-structure.sh](scripts/generate-structure.sh):

| Forma | Uso | Ejemplo |
| --- | --- | --- |
| `kebab-case` | nombres de archivos y carpetas | `user-profile.service.ts` |
| `PascalCase` | clases, interfaces, Models, DTOs | `UserProfileModel`, `IUserProfileService` |
| `camelCase` | variables, providers, métodos | `userProfileRepository`, `findById` |
| `snake_case` (plural) | tablas DB | `user_profiles` |
| `Cat<Nombre>` | clases de catálogo | `CatRoleModel`, `CatRoleRepository` |
| `I<Nombre>...` | interfaces de puerto | `IUserRepository`, `IUserService` |
| `Symbols<Nombre>` | objeto de símbolos | `SymbolsUser`, `SymbolsCatalogs` |

Archivos por convención:

- Servicio: `<modulo>.service.ts`
- Repositorio: `<modulo>.repository.ts`
- Controlador: `<modulo>.controller.ts`
- DTO: `<modulo>.dto.ts`
- Modelo: `<modulo>.model.ts`
- Entidad TypeORM: `<modulo>.entity.ts`
- Interfaces: `<modulo>.interface.repository.ts`, `<modulo>.interface.service.ts`
- Types: `<modulo>.types.ts` (o `.type.ts`, respetar lo que ya use el módulo similar)

---

# Manejo de Errores

- Todo error de dominio o de infraestructura se debe encapsular con `BaseErrorException`
  ([src/core/domain/exceptions/base.error.exception.ts](src/core/domain/exceptions/base.error.exception.ts))
- Usar `HttpStatus` de `@nestjs/common` para el status code
- Mensajes en inglés, claros y accionables (siguiendo la convención existente del repo)
- En services y repositories usar `try/catch` + `throw new BaseErrorException(error.message, error.statusCode)`
- En controllers NO atrapar errores

---

# Metodología de Trabajo

## Antes de tocar código

1. Identificar la **capa** afectada (domain / application / infrastructure)
2. Identificar si existe **interfaz** afectada (cambios en `I<Modulo>Repository` o `I<Modulo>Service`)
3. Verificar **dependencias inversas**: ¿alguien más depende de esa interfaz?
4. Si se necesita un módulo nuevo → preferir
   [scripts/generate-structure.sh](scripts/generate-structure.sh)
5. Confirmar si el dato vive en `public` o `catalogs` (decide el schema y la ruta core)

## Durante la modificación

1. Comenzar SIEMPRE por el **dominio** (Model, interfaz, type)
2. Luego **application** (service implementando la interfaz)
3. Por último **infrastructure** (repositorio TypeORM, controller, DTO, custom-provider, module)
4. Si una nueva dependencia externa aparece (mailer, queue, S3, etc.), crear un **port** en
   `domain/repositories` o `domain/services` y su **adapter** en `infrastructure/<tecnologia>/...`

## Antes de cerrar la tarea

Checklist obligatorio:

- [ ] No hay imports de framework / ORM en `domain/`
- [ ] No hay imports cruzados de `infrastructure/` desde `application/`
- [ ] Toda inyección usa `@Inject(Symbols...)` apuntando a interfaz
- [ ] El módulo registra los providers vía `custom-provider.ts`, no clases sueltas
- [ ] El controller solo delega
- [ ] El service no toca TypeORM
- [ ] El repository mapea Entity ⇆ Model (nunca devuelve Entity hacia afuera)
- [ ] El DTO valida entrada con `class-validator` y documenta con `@ApiProperty`
- [ ] Naming respeta kebab/Pascal/camel/snake según corresponda
- [ ] Errores envueltos en `BaseErrorException`
- [ ] Si es módulo nuevo: agregado a [src/app.module.ts](src/app.module.ts) y, si aplica, entidad
      core en `src/core/infrastructure/typeorm/entities/<schema>/`

---

# Cuándo crear un Port nuevo

Crear una nueva interfaz en `domain/repositories/` o `domain/services/` cada vez que el dominio
necesite hablar con algo externo:

| Necesidad | Port (domain) | Adapter (infrastructure) |
| --- | --- | --- |
| Persistir entidad | `IXxxRepository` | `XxxRepository` (TypeORM) |
| Enviar email | `IMailerService` | `NodemailerMailerService` / `SendgridMailerService` |
| Subir archivos | `IStorageService` | `S3StorageService` |
| Encolar trabajos | `IQueueService` | `BullQueueService` |
| Llamar API externa | `IXxxClient` | `XxxHttpClient` (axios/fetch) |
| Hash / crypto | `IPasswordHasher` | `BcryptPasswordHasher` |

> El dominio **nunca** importa la librería; solo el adapter lo hace.

---

# Output Esperado

Cuando se trabaje sobre una tarea de creación o modificación, el resultado debe:

## 1. Explicar brevemente la ubicación de los cambios

Ejemplo:

- `domain/models/order.model.ts` (nuevo agregado)
- `domain/repositories/order.interface.repository.ts` (nuevo port)
- `application/services/order.service.ts` (nuevo caso de uso)
- `infrastructure/typeorm/repositories/order.repository.ts` (adapter)
- `infrastructure/nest/controllers/order.controller.ts` (entrada HTTP)

## 2. Aplicar cambios concretos respetando las reglas

Modificar archivos directamente siguiendo la plantilla del módulo `user` /
[scripts/generate-structure.sh](scripts/generate-structure.sh).

## 3. Avisar si algo se sale del patrón

Si la tarea exige algo que no encaja (ej. lógica que requiere transacciones cross-módulo,
agregar un nuevo schema, introducir CQRS, eventos de dominio, etc.) **detenerse y proponer** cómo
encajarlo en la arquitectura antes de implementarlo.

---

# Anti-patterns a Detectar y Corregir

Si al leer el código se encuentran estos olores, **señalarlos y proponer la corrección**:

- Repositorios devolviendo entidades TypeORM en lugar de Models
- Controllers con lógica de negocio o llamando a `Repository<X>` directamente
- Services usando `@InjectRepository`
- DTOs reutilizados como Types del dominio
- Decoradores de NestJS / TypeORM en `domain/`
- Providers registrados como clase suelta sin pasar por Symbols
- Imports relativos profundos (`../../../../`) cruzando capas en la dirección incorrecta
- Models sin `create()` / `hydrate()` / `toJSON()`
- Entidades del módulo definiendo columnas en lugar de extender la entidad core
- Falta de `BaseErrorException` en errores manejados

---

# Objetivo Final

Que cualquier módulo nuevo o modificación:

- Sea **indistinguible** del módulo `user` en estilo y estructura
- Mantenga el dominio **puro** y testeable sin levantar Nest
- Permita reemplazar TypeORM, NestJS o cualquier adapter sin tocar `domain/` ni `application/`
- Respete las convenciones de naming, providers y errores ya establecidas
- Pase el checklist final antes de darse por terminado
