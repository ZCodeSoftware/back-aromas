import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import SymbolsAnalytics from "../../../analytics/symbols-analytics";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import SymbolsProduct from "../../../product/symbols-product";
import { CartModel } from "../../domain/models/cart.model";
import { ICartRepository } from "../../domain/repositories/cart.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { ICartService } from "../../domain/services/cart.interface.service";
import { IAddCartItem, ICartProduct } from "../../domain/types/cart.type";
import SymbolsCart from "../../symbols-cart";

@Injectable()
export class CartService implements ICartService {
    private readonly logger = new Logger(CartService.name);

    constructor(
        @Inject(SymbolsCart.ICartRepository)
        private readonly cartRepository: ICartRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(SymbolsAnalytics.IMetricsRepository)
        private readonly metricsRepository: IMetricsRepository
    ) { }

    async getByUser(userId: string): Promise<CartModel> {
        const cart = await this.cartRepository.findByUser(userId);
        if (cart) return cart;

        return this.cartRepository.create(CartModel.create({ user: userId }));
    }

    async addItem(userId: string, item: IAddCartItem): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        const product = await this.loadAvailableProduct(item.productId);

        const alreadyInCart = cart.findItem(item.productId)?.quantity ?? 0;
        this.assertStock(product, alreadyInCart + item.quantity);

        cart.addItem({ _id: product._id, price: product.price }, item.quantity);

        const updatedCart = await this.cartRepository.update(cart);

        // Fire and forget: a metrics failure must never break adding to the cart.
        this.metricsRepository
            .incrementAddCartTimes(item.productId)
            .catch((error) => this.logger.warn(`Could not track add-to-cart of ${item.productId}: ${error?.message}`));

        return updatedCart;
    }

    async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartModel> {
        const cart = await this.getByUser(userId);

        if (!cart.findItem(productId)) {
            throw new BaseErrorException('Product is not in the cart', HttpStatus.NOT_FOUND);
        }

        if (quantity > 0) {
            const product = await this.loadAvailableProduct(productId);
            this.assertStock(product, quantity);
            // Keep the line aligned with the current catalogue price.
            cart.findItem(productId).setUnitPrice(product.price);
        }

        cart.updateItemQuantity(productId, quantity);

        return this.cartRepository.update(cart);
    }

    async removeItem(userId: string, productId: string): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        cart.removeItem(productId);

        return this.cartRepository.update(cart);
    }

    async clear(userId: string): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        cart.clear();

        return this.cartRepository.update(cart);
    }

    private async loadAvailableProduct(productId: string): Promise<ICartProduct> {
        const product = await this.productRepository.findById(productId);

        if (!product) {
            throw new BaseErrorException('Product not found', HttpStatus.NOT_FOUND);
        }

        if (!product.isActive) {
            throw new BaseErrorException(`Product ${product.name} is not available`, HttpStatus.BAD_REQUEST);
        }

        return product;
    }

    private assertStock(product: ICartProduct, requestedQuantity: number): void {
        if (requestedQuantity > product.stock) {
            throw new BaseErrorException(
                `Insufficient stock for ${product.name}: ${product.stock} available, ${requestedQuantity} requested`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
