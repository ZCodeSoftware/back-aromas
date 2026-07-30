import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import SymbolsProduct from "../../../product/symbols-product";
import { OrderModel } from "../../domain/models/order.model";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IStockReservationService } from "../../domain/services/stock-reservation.interface.service";
import { IOrderLine, IStockReservation } from "../../domain/types/order.type";

@Injectable()
export class StockReservationService implements IStockReservationService {
    private readonly logger = new Logger(StockReservationService.name);

    constructor(
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
    ) { }

    async reserve(lines: IOrderLine[]): Promise<IStockReservation[]> {
        const reserved: IStockReservation[] = [];

        for (const { product, quantity } of lines) {
            const taken = await this.productRepository.decrementStock(product._id, quantity);

            if (!taken) {
                await this.release(reserved);
                throw new BaseErrorException(
                    `Insufficient stock for ${product.name}, please review the items`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            reserved.push({ productId: product._id, quantity });
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

        await this.release(
            order.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        );

        order.markStockRestored();
    }
}
