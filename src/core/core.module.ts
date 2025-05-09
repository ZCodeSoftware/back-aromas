import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import config from "src/config";

@Module({
    imports: [MongooseModule.forRoot(config().mongo.mongo_uri)],
    controllers: [],
    providers: [],
    exports: [MongooseModule]
})

export class CoreModule { }