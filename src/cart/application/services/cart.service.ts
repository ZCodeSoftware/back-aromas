import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import SymbolsAnalytics from "../../../analytics/symbols-analytics";
import SymbolsCombo from "../../../combo/symbols-combo";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import SymbolsProduct from "../../../product/symbols-product";
import { CartItemType } from "../../domain/enum/cart-item-type.enum";
import { CartItemModel } from "../../domain/models/cart-item.model";
import { CartModel } from "../../domain/models/cart.model";
import { ICartRepository } from "../../domain/repositories/cart.interface.repository";
import { IComboRepository } from "../../domain/repositories/combo.interface.repository";
import { IMetricsRepository } from "../../domain/repositories/metrics.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { ICartService } from "../../domain/services/cart.interface.service";
import { IAddCartItem, ICartCombo, ICartProduct } from "../../domain/types/cart.type";
import SymbolsCart from "../../symbols-cart";

@Injectable()
export class CartService implements ICartService {
    private readonly logger = new Logger(CartService.name);

    constructor(
        @Inject(SymbolsCart.ICartRepository)
        private readonly cartRepository: ICartRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
        @Inject(SymbolsCombo.IComboRepository)
        private readonly comboRepository: IComboRepository,
        @Inject(SymbolsAnalytics.IMetricsRepository)
        private readonly metricsRepository: IMetricsRepository
    ) { }

    async getByUser(userId: string): Promise<CartModel> {
        const cart = await this.cartRepository.findByUser(userId);
        if (cart) return cart;

        return this.cartRepository.create(CartModel.create({ user: userId }));
    }

    async addItem(userId: string, item: IAddCartItem): Promise<CartModel> {
        if (!item.productId === !item.comboId) {
            throw new BaseErrorException(
                'Provide either productId or comboId, not both',
                HttpStatus.BAD_REQUEST,
            );
        }

        return item.comboId
            ? this.addComboItem(userId, item.comboId, item.quantity)
            : this.addProductItem(userId, item.productId, item.quantity);
    }

    async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        const key = CartItemModel.keyOf(CartItemType.PRODUCT, productId);

        if (!cart.findItem(key)) {
            throw new BaseErrorException('Product is not in the cart', HttpStatus.NOT_FOUND);
        }

        if (quantity > 0) {
            const product = await this.loadAvailableProduct(productId);
            this.assertProductStock(product, quantity);
            // Keep the line aligned with the current catalogue price.
            cart.findItem(key).setUnitPrice(product.price);
        }

        cart.updateItemQuantity(key, quantity);

        return this.cartRepository.update(cart);
    }

    async updateComboQuantity(userId: string, comboId: string, quantity: number): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        const key = CartItemModel.keyOf(CartItemType.COMBO, comboId);

        if (!cart.findItem(key)) {
            throw new BaseErrorException('Combo is not in the cart', HttpStatus.NOT_FOUND);
        }

        if (quantity > 0) {
            const combo = await this.loadAvailableCombo(comboId);
            this.assertComboStock(combo, quantity);
            cart.findItem(key).setUnitPrice(combo.price);
        }

        cart.updateItemQuantity(key, quantity);

        return this.cartRepository.update(cart);
    }

    async removeItem(userId: string, productId: string): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        cart.removeItem(CartItemModel.keyOf(CartItemType.PRODUCT, productId));

        return this.cartRepository.update(cart);
    }

    async removeCombo(userId: string, comboId: string): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        cart.removeItem(CartItemModel.keyOf(CartItemType.COMBO, comboId));

        return this.cartRepository.update(cart);
    }

    async clear(userId: string): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        cart.clear();

        return this.cartRepository.update(cart);
    }

    /**
     * Stored so it survives a page reload. Deliberately not validated here: the
     * only figure that counts is the one the pricing preview and the checkout
     * compute, and a code that was valid today may not be tomorrow.
     */
    async setCoupon(userId: string, code?: string): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        cart.setCouponCode(code);

        return this.cartRepository.update(cart);
    }

    private async addProductItem(userId: string, productId: string, quantity: number): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        const product = await this.loadAvailableProduct(productId);

        const alreadyInCart = cart.findProductItem(productId)?.quantity ?? 0;
        this.assertProductStock(product, alreadyInCart + quantity);

        cart.addItem({ _id: product._id, price: product.price }, quantity);

        const updatedCart = await this.cartRepository.update(cart);

        // Fire and forget: a metrics failure must never break adding to the cart.
        this.metricsRepository
            .incrementAddCartTimes(productId)
            .catch((error) => this.logger.warn(`Could not track add-to-cart of ${productId}: ${error?.message}`));

        return updatedCart;
    }

    private async addComboItem(userId: string, comboId: string, quantity: number): Promise<CartModel> {
        const cart = await this.getByUser(userId);
        const combo = await this.loadAvailableCombo(comboId);

        const alreadyInCart = cart.findComboItem(comboId)?.quantity ?? 0;
        this.assertComboStock(combo, alreadyInCart + quantity);

        cart.addCombo({ _id: combo._id, price: combo.price }, quantity);

        // No add-to-cart metric: the metrics collection is keyed by product, and
        // attributing a combo to its components would inflate their counters.
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

    private async loadAvailableCombo(comboId: string): Promise<ICartCombo> {
        const combo = await this.comboRepository.findById(comboId);

        if (!combo) {
            throw new BaseErrorException('Combo not found', HttpStatus.NOT_FOUND);
        }

        if (!combo.isActive) {
            throw new BaseErrorException(`Combo ${combo.name} is not available`, HttpStatus.BAD_REQUEST);
        }

        if (!combo.hasAllComponentsAvailable) {
            throw new BaseErrorException(
                `Combo ${combo.name} has products that are no longer available`,
                HttpStatus.BAD_REQUEST,
            );
        }

        return combo;
    }

    private assertProductStock(product: ICartProduct, requestedQuantity: number): void {
        if (requestedQuantity > product.stock) {
            throw new BaseErrorException(
                `Insufficient stock for ${product.name}: ${product.stock} available, ${requestedQuantity} requested`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    /** The combo stock is derived from its scarcest component; see ComboModel. */
    private assertComboStock(combo: ICartCombo, requestedQuantity: number): void {
        if (requestedQuantity > combo.stock) {
            throw new BaseErrorException(
                `Insufficient stock for ${combo.name}: ${combo.stock} available, ${requestedQuantity} requested`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
