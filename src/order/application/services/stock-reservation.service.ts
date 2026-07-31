import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import SymbolsProduct from "../../../product/symbols-product";
import { OrderModel } from "../../domain/models/order.model";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IStockReservationService } from "../../domain/services/stock-reservation.interface.service";
import { IStockLine, IStockReservation } from "../../domain/types/order.type";

@Injectable()
export class StockReservationService implements IStockReservationService {
    private readonly logger = new Logger(StockReservationService.name);

    constructor(
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
    ) { }

    async reserve(lines: IStockLine[]): Promise<IStockReservation[]> {
        const reserved: IStockReservation[] = [];

        for (const { productId, quantity, name } of lines) {
            const taken = await this.productRepository.decrementStock(productId, quantity);

            if (!taken) {
                await this.release(reserved);
                throw new BaseErrorException(
                    `Insufficient stock for ${name ?? productId}, please review the items`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            reserved.push({ productId, quantity });
        }

        return reserved;
    }

    async release(reserved: IStockReservation[]): Promise<void> {
        for (const { productId, quantity } of reserved) {
            try {
                await this.productRepository.incrementStock(productId, quantity);
            } catch (error) {
                this.logger.error(`Could not restore ${quantity} units of product ${productId}`, error?.stack);
            }
        }
    }

    async restoreOnce(order: OrderModel): Promise<void> {
        if (order.stockRestored) return;

        // stockLines(), not items: a combo line references a combo, and what has to
        // be given back are the component products behind it.
        await this.release(order.stockLines());

        order.markStockRestored();
    }
}
