import { HttpStatus } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { OrderStatus } from "../../../domain/enums/order-status.enum";
import { BaseErrorException } from "../../../domain/exceptions/base.error.exception";
import { CatOrderStatus } from "../schemas/catalogs/cat-order-status.schema";

/** The slice of a catalogue row every consumer of the order lifecycle needs. */
export interface IOrderStatusRef {
    _id: string;
    code: OrderStatus;
    name: string;
}

/**
 * Read side of `cat_order_status`, shared by the modules that have to translate a
 * status code into the ObjectId an order actually stores.
 *
 * Plain class rather than a Nest provider: every module wires its own thin
 * repository around it, the same way each one owns its CatPaymentMethod adapter.
 *
 * The whole catalogue is cached for the lifetime of the process, which is safe
 * because `code` is immutable and the row set is fixed by the OrderStatus enum.
 * A partial read is never cached, so the first call after seeding still wins.
 */
export class OrderStatusCatalog {
    private cache: Map<string, IOrderStatusRef> | null = null;

    constructor(private readonly catOrderStatusDB: Model<CatOrderStatus>) { }

    async findByCode(code: OrderStatus): Promise<IOrderStatusRef | null> {
        return (await this.rows()).get(code) ?? null;
    }

    /** Ids for a `$in` match, in the order the codes were given. */
    async idsByCodes(codes: OrderStatus[]): Promise<Types.ObjectId[]> {
        const rows = await this.rows();

        return codes.map((code) => {
            const row = rows.get(code);

            if (!row) {
                throw new BaseErrorException(
                    `Order status ${code} is missing from the catalogue`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return new Types.ObjectId(row._id);
        });
    }

    private async rows(): Promise<Map<string, IOrderStatusRef>> {
        if (this.cache) return this.cache;

        const documents = await this.catOrderStatusDB.find().select('code name').lean();

        const rows = new Map<string, IOrderStatusRef>(
            documents.map((document) => [
                document.code,
                { _id: String(document._id), code: document.code as OrderStatus, name: document.name },
            ]),
        );

        // Only a complete catalogue is worth keeping: a half-seeded database must
        // not freeze a broken map into the process for good.
        if (Object.values(OrderStatus).every((code) => rows.has(code))) {
            this.cache = rows;
        }

        return rows;
    }
}
