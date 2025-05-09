# Nombre del esquema en minúsculas y PascalCase
SCHEMA_NAME=$(echo "$1" | tr '[:upper:]' '[:lower:]') # minúsculas
CLASS_NAME=$(echo "$1" | sed -r 's/(^|_)([a-z])/\U\2/g') # PascalCase

# Ruta base
BASE_PATH="./src/core/infrastructure/mongo/schemas"

# Crear directorio si no existe
mkdir -p $BASE_PATH

# Crear archivo del schema
cat > $BASE_PATH/${SCHEMA_NAME}.schema.ts <<EOL
import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ${CLASS_NAME}Document = HydratedDocument<${CLASS_NAME}>;

@Schema({ collection: '${SCHEMA_NAME}', timestamps: true })
export class ${CLASS_NAME} {

}

export const ${CLASS_NAME}Schema = SchemaFactory.createForClass(${CLASS_NAME});
EOL

echo "Schema ${SCHEMA_NAME}.schema.ts creado en ${BASE_PATH}."