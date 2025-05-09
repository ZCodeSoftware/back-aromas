#!/bin/bash

# Verifica que se pase un argumento
if [ -z "$1" ]; then
  echo "Por favor, proporciona el nombre del módulo (por ejemplo: folder)."
  exit 1
fi

# Nombre del módulo en minúsculas y PascalCase
MODULE_NAME=$(echo "$1" | tr '[:upper:]' '[:lower:]') # minúsculas
CLASS_NAME=$(echo "$1" | sed -r 's/(^|_)([a-z])/\U\2/g') # PascalCase

# Base path
BASE_PATH="./src/$MODULE_NAME"

# Crear directorios
mkdir -p $BASE_PATH/application/services \
         $BASE_PATH/domain/models \
         $BASE_PATH/domain/repositories \
         $BASE_PATH/domain/services \
         $BASE_PATH/domain/types \
         $BASE_PATH/infrastructure/mongo/repositories \
         $BASE_PATH/infrastructure/mongo/schemas \
         $BASE_PATH/infrastructure/nest/constants \
         $BASE_PATH/infrastructure/nest/controllers \
         $BASE_PATH/infrastructure/nest/dtos

# Crear archivos con contenido dinámico
cat <<EOL > $BASE_PATH/application/services/${MODULE_NAME}.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { ${CLASS_NAME}Model } from "../../domain/models/${MODULE_NAME}.model";
import { I${CLASS_NAME}Repository } from "../../domain/repositories/${MODULE_NAME}.interface.repository";
import { I${CLASS_NAME}Service } from "../../domain/services/${MODULE_NAME}.interface.service";
import { ICreate${CLASS_NAME} } from "../../domain/types/${MODULE_NAME}.type";
import Symbols${CLASS_NAME} from "../../symbols-${MODULE_NAME}";

@Injectable()
export class ${CLASS_NAME}Service implements I${CLASS_NAME}Service {
    constructor(
        @Inject(Symbols${CLASS_NAME}.I${CLASS_NAME}Repository)
        private readonly ${MODULE_NAME}Repository: I${CLASS_NAME}Repository
    ) { }

    async create(${MODULE_NAME}: ICreate${CLASS_NAME}): Promise<${CLASS_NAME}Model> {
        const ${MODULE_NAME}Model = ${CLASS_NAME}Model.create(${MODULE_NAME});
        return this.${MODULE_NAME}Repository.create(${MODULE_NAME}Model);
    }

    async findById(id: string): Promise<${CLASS_NAME}Model> {
        return this.${MODULE_NAME}Repository.findById(id);
    }

    async findAll(): Promise<${CLASS_NAME}Model[]> {
        return this.${MODULE_NAME}Repository.findAll();
    }
}
EOL

cat > $BASE_PATH/domain/models/${MODULE_NAME}.model.ts <<EOL
import { BaseModel } from '../../../core/domain/models/base.model';
import { Identifier } from '../../../core/domain/value-objects/identifier';

export class ${CLASS_NAME}Model extends BaseModel {

  public toJSON() {
    const aggregate = this._id ? { _id: this._id.toValue() } : {};
    return {
      ...aggregate,
    };
  }

  static create(${MODULE_NAME}: any): ${CLASS_NAME}Model {
    const new${CLASS_NAME} = new ${CLASS_NAME}Model(new Identifier(${MODULE_NAME}._id));
    return new${CLASS_NAME};
  }

  static hydrate(${MODULE_NAME}: any): ${CLASS_NAME}Model {
    const new${CLASS_NAME} = new ${CLASS_NAME}Model(new Identifier(${MODULE_NAME}._id));
    return new${CLASS_NAME};
  }
}
EOL

cat > $BASE_PATH/domain/repositories/${MODULE_NAME}.interface.repository.ts <<EOL
import { ${CLASS_NAME}Model } from "../models/${MODULE_NAME}.model";

export interface I${CLASS_NAME}Repository {
    create(${MODULE_NAME}: ${CLASS_NAME}Model): Promise<${CLASS_NAME}Model>;
    findById(id: string): Promise<${CLASS_NAME}Model>;
    findAll(): Promise<${CLASS_NAME}Model[]>;
}
EOL

cat > $BASE_PATH/domain/services/${MODULE_NAME}.interface.service.ts <<EOL
import { ${CLASS_NAME}Model } from "../models/${MODULE_NAME}.model";
import { ICreate${CLASS_NAME} } from "../types/${MODULE_NAME}.type";

export interface I${CLASS_NAME}Service {
    create(${MODULE_NAME}: ICreate${CLASS_NAME}): Promise<${CLASS_NAME}Model>;
    findById(id: string): Promise<${CLASS_NAME}Model>;
    findAll(): Promise<${CLASS_NAME}Model[]>;
}
EOL

echo "export interface ICreate${CLASS_NAME}{};" > $BASE_PATH/domain/types/${MODULE_NAME}.type.ts

cat <<EOL > $BASE_PATH/infrastructure/mongo/repositories/${MODULE_NAME}.repository.ts
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseErrorException } from "../../../../core/domain/exceptions/base.error.exception";
import { ${CLASS_NAME}Model } from "../../../domain/models/${MODULE_NAME}.model";
import { I${CLASS_NAME}Repository } from "../../../domain/repositories/${MODULE_NAME}.interface.repository";
import { ${CLASS_NAME}Schema } from "../schemas/${MODULE_NAME}.schema";

@Injectable()
export class ${CLASS_NAME}Repository implements I${CLASS_NAME}Repository {
    constructor(
        @InjectModel('${CLASS_NAME}') private readonly ${MODULE_NAME}DB: Model<${CLASS_NAME}Schema>
    ) { }

    async create(${MODULE_NAME}: ${CLASS_NAME}Model): Promise<${CLASS_NAME}Model> {
        const schema = new this.${MODULE_NAME}DB(${MODULE_NAME}.toJSON());
        const new${CLASS_NAME} = await schema.save();

        if (!new${CLASS_NAME}) throw new BaseErrorException(\`${CLASS_NAME} shouldn't be created\`, HttpStatus.BAD_REQUEST);

        return ${CLASS_NAME}Model.hydrate(new${CLASS_NAME});
    }

    async findById(id: string): Promise<${CLASS_NAME}Model> {
        const ${MODULE_NAME} = await this.${MODULE_NAME}DB.findById(id);
        if (!${MODULE_NAME}) throw new BaseErrorException('${CLASS_NAME} not found', HttpStatus.NOT_FOUND);
        return ${CLASS_NAME}Model.hydrate(${MODULE_NAME});
    }

    async findAll(): Promise<${CLASS_NAME}Model[]> {
        const ${MODULE_NAME}s = await this.${MODULE_NAME}DB.find();
        return ${MODULE_NAME}s?.map(${MODULE_NAME} => ${CLASS_NAME}Model.hydrate(${MODULE_NAME}));
    }
}
EOL

cat <<EOL > $BASE_PATH/infrastructure/mongo/schemas/${MODULE_NAME}.schema.ts
import { ${CLASS_NAME} as Core${CLASS_NAME} } from '../../../../core/infrastructure/mongo/schemas/public/${MODULE_NAME}.schema';

export class ${CLASS_NAME}Schema extends Core${CLASS_NAME} {}
EOL

# Archivo custom-provider.ts
cat <<EOL > $BASE_PATH/infrastructure/nest/constants/custom-provider.ts
import { ${CLASS_NAME}Service } from '../../../application/services/${MODULE_NAME}.service';
import Symbols${CLASS_NAME} from '../../../symbols-${MODULE_NAME}';
import { ${CLASS_NAME}Repository } from '../../mongo/repositories/${MODULE_NAME}.repository';

export const ${MODULE_NAME}Service = {
  provide: Symbols${CLASS_NAME}.I${CLASS_NAME}Service,
  useClass: ${CLASS_NAME}Service,
};

export const ${MODULE_NAME}Repository = {
  provide: Symbols${CLASS_NAME}.I${CLASS_NAME}Repository,
  useClass: ${CLASS_NAME}Repository,
};
EOL

# Archivo custom-schema.ts
cat <<EOL > $BASE_PATH/infrastructure/nest/constants/custom-schema.ts
import { ${CLASS_NAME}Schema, ${CLASS_NAME} } from '../../../../core/infrastructure/mongo/schemas/public/${MODULE_NAME}.schema';

export const ${MODULE_NAME}Schema = {
  name: ${CLASS_NAME}.name,
  schema: ${CLASS_NAME}Schema,
};
EOL

# Archivo controlador
cat > $BASE_PATH/infrastructure/nest/controllers/${MODULE_NAME}.controller.ts <<EOL
import { Body, Controller, Get, HttpCode, Inject, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { I${CLASS_NAME}Service } from "../../../domain/services/${MODULE_NAME}.interface.service";
import Symbols${CLASS_NAME} from "../../../symbols-${MODULE_NAME}";
import { Create${CLASS_NAME}DTO } from "../dtos/${MODULE_NAME}.dto";

@ApiTags('${MODULE_NAME}')
@Controller('${MODULE_NAME}')
export class ${CLASS_NAME}Controller {
    constructor(
        @Inject(Symbols${CLASS_NAME}.I${CLASS_NAME}Service)
        private readonly ${MODULE_NAME}Service: I${CLASS_NAME}Service
    ) { }

    @Post()
    @HttpCode(201)
    @ApiResponse({ status: 201, description: '${CLASS_NAME} created' })
    @ApiResponse({ status: 400, description: \`${CLASS_NAME} shouldn't be created\` })
    @ApiBody({ type: Create${CLASS_NAME}DTO, description: 'Data to create a ${CLASS_NAME}' })
    async create(@Body() body: Create${CLASS_NAME}DTO) {
        return this.${MODULE_NAME}Service.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all ${CLASS_NAME}s' })
    @ApiResponse({ status: 404, description: '${CLASS_NAME} not found' })
    async findAll() {
        return this.${MODULE_NAME}Service.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return ${CLASS_NAME} by id' })
    @ApiResponse({ status: 404, description: '${CLASS_NAME} not found' })
    async findById(@Param('id') id: string) {
        return this.${MODULE_NAME}Service.findById(id);
    }
}
EOL

# Archivo DTO
echo "export class Create${CLASS_NAME}DTO {}" > $BASE_PATH/infrastructure/nest/dtos/${MODULE_NAME}.dto.ts

# Archivo principal del módulo
cat > $BASE_PATH/${MODULE_NAME}.module.ts <<EOL
import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ${MODULE_NAME}Repository,
  ${MODULE_NAME}Service,
} from './infrastructure/nest/constants/custom-provider';
import {
  ${MODULE_NAME}Schema,
} from './infrastructure/nest/constants/custom-schema';
import { ${CLASS_NAME}Controller } from './infrastructure/nest/controllers/${MODULE_NAME}.controller';

@Module({
  imports: [MongooseModule.forFeature([${MODULE_NAME}Schema])],
  controllers: [${CLASS_NAME}Controller],
  providers: [${MODULE_NAME}Service, ${MODULE_NAME}Repository],
  exports: []
})
export class ${CLASS_NAME}Module {}
EOL

# Archivo de símbolos
cat <<EOL > $BASE_PATH/symbols-${MODULE_NAME}.ts
const Symbols${CLASS_NAME} = {
  I${CLASS_NAME}Repository: Symbol.for('I${CLASS_NAME}Repository'),
  I${CLASS_NAME}Service: Symbol.for('I${CLASS_NAME}Service'),
};

export default Symbols${CLASS_NAME};
EOL

echo "Estructura del módulo ${MODULE_NAME} creada exitosamente en ${BASE_PATH}."