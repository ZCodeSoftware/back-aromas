import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import SymbolsProduct from "../../../product/symbols-product";
import { ComboModel } from "../../domain/models/combo.model";
import { IComboRepository } from "../../domain/repositories/combo.interface.repository";
import { IProductRepository } from "../../domain/repositories/product.interface.repository";
import { IComboService } from "../../domain/services/combo.interface.service";
import { IComboFilterOptions, IComboItem, ICreateCombo } from "../../domain/types/combo.type";
import SymbolsCombo from "../../symbols-combo";

@Injectable()
export class ComboService implements IComboService {
    constructor(
        @Inject(SymbolsCombo.IComboRepository)
        private readonly comboRepository: IComboRepository,
        @Inject(SymbolsProduct.IProductRepository)
        private readonly productRepository: IProductRepository,
    ) { }

    async create(combo: ICreateCombo): Promise<ComboModel> {
        const { items, ...rest } = combo;

        return this.comboRepository.create(
            ComboModel.create({ ...rest, items: await this.resolveItems(items) }),
        );
    }

    async findById(id: string): Promise<ComboModel> {
        return this.comboRepository.findById(id);
    }

    async findAll(options: IComboFilterOptions): Promise<PaginatedResponse<ComboModel>> {
        return this.comboRepository.findAll(options);
    }

    async update(id: string, combo: Partial<ICreateCombo>): Promise<ComboModel> {
        const existing = await this.comboRepository.findById(id);

        // Items arrive as ids and are resolved below, so they stay out of the spread:
        // a partial update that does not mention them must keep the ones already there.
        const { items, ...rest } = combo;
        const resolvedItems = items ? await this.resolveItems(items) : existing.toJSON().items;

        // Rebuilt through create() rather than hydrate() so the price-mode rules run
        // again: switching a combo from PERCENTAGE to FIXED must still demand a price.
        const updated = ComboModel.create({ ...existing.toJSON(), ...rest, items: resolvedItems });

        return this.comboRepository.update(id, updated);
    }

    async delete(id: string): Promise<ComboModel> {
        return this.comboRepository.softDelete(id);
    }

    /**
     * Turns the ids from the request into live products. Resolving them here, at
     * write time, is what lets the model reject a combo built on a product that
     * does not exist — and it is also what the model needs to price itself.
     */
    private async resolveItems(items: IComboItem[]): Promise<{ product: any; quantity: number }[]> {
        if (!items?.length) {
            throw new BaseErrorException('A combo needs at least one product', HttpStatus.BAD_REQUEST);
        }

        const resolved = [];

        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);

            if (!product) {
                throw new BaseErrorException(
                    `Product ${item.productId} does not exist and cannot be part of a combo`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            resolved.push({ product, quantity: item.quantity });
        }

        return resolved;
    }
}
