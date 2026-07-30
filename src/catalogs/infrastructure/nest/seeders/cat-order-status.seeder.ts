import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderStatus } from "../../../../core/domain/enums/order-status.enum";
import { CatOrderStatusSchema } from "../../mongo/schemas/cat-order-status.schema";

/**
 * Default rows of the order-status catalogue. The order flow needs every one of
 * these codes to exist, so they are written on boot instead of being left to a
 * manual load.
 */
export const CAT_ORDER_STATUS_SEED = [
    { code: OrderStatus.PENDING, name: 'Pendiente', sortOrder: 1 },
    { code: OrderStatus.PAID, name: 'Pagado', sortOrder: 2 },
    { code: OrderStatus.SHIPPED, name: 'Enviado', sortOrder: 3 },
    { code: OrderStatus.DELIVERED, name: 'Entregado', sortOrder: 4 },
    { code: OrderStatus.CANCELLED, name: 'Cancelado', sortOrder: 5 },
    { code: OrderStatus.REFUNDED, name: 'Reembolsado', sortOrder: 6 },
];

@Injectable()
export class CatOrderStatusSeeder implements OnModuleInit {
    private readonly logger = new Logger(CatOrderStatusSeeder.name);

    constructor(
        @InjectModel('CatOrderStatus') private readonly catOrderStatusDB: Model<CatOrderStatusSchema>
    ) { }

    /**
     * Idempotent: `$setOnInsert` only writes when the row is missing, so a label
     * an admin rewrote from the ABM survives every restart.
     */
    async onModuleInit(): Promise<void> {
        try {
            const result = await this.catOrderStatusDB.bulkWrite(
                CAT_ORDER_STATUS_SEED.map((status) => ({
                    updateOne: {
                        filter: { code: status.code },
                        update: { $setOnInsert: { ...status, isActive: true } },
                        upsert: true,
                    },
                })),
            );

            if (result.upsertedCount) {
                this.logger.log(`Seeded ${result.upsertedCount} order statuses`);
            }
        } catch (error) {
            // Boot must not die on this: the catalogue may already be complete and
            // the order flow fails loudly on its own if a code is really missing.
            this.logger.error(`Could not seed the order status catalogue: ${error?.message}`);
        }
    }
}
