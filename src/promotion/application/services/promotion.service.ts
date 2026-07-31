import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { PaginatedResponse } from "../../../core/domain/response/find-all-paginated.response";
import { PromotionModel } from "../../domain/models/promotion.model";
import { IPromotionRepository } from "../../domain/repositories/promotion.interface.repository";
import { IPromotionService } from "../../domain/services/promotion.interface.service";
import { ICreatePromotion, IPromotionFilterOptions } from "../../domain/types/promotion.type";
import SymbolsPromotion from "../../symbols-promotion";

@Injectable()
export class PromotionService implements IPromotionService {
    constructor(
        @Inject(SymbolsPromotion.IPromotionRepository)
        private readonly promotionRepository: IPromotionRepository,
    ) { }

    async create(promotion: ICreatePromotion): Promise<PromotionModel> {
        await this.assertCodeIsFree(promotion.code);

        return this.promotionRepository.create(PromotionModel.create(promotion));
    }

    async findById(id: string): Promise<PromotionModel> {
        return this.promotionRepository.findById(id);
    }

    async findAll(options: IPromotionFilterOptions): Promise<PaginatedResponse<PromotionModel>> {
        return this.promotionRepository.findAll(options);
    }

    async findActiveAutomatic(): Promise<PromotionModel[]> {
        return this.promotionRepository.findActiveAutomatic(new Date());
    }

    async update(id: string, promotion: Partial<ICreatePromotion>): Promise<PromotionModel> {
        const existing = await this.promotionRepository.findById(id);

        if (promotion.code !== undefined) {
            await this.assertCodeIsFree(promotion.code, id);
        }

        // Rebuilt through create() rather than hydrate() so the scope and value
        // rules run again: switching a promotion to CATEGORY must still demand at
        // least one category. usedCount is carried over so an edit never resets it.
        const updated = PromotionModel.create({ ...existing.toJSON(), ...promotion });

        return this.promotionRepository.update(id, updated);
    }

    async delete(id: string): Promise<PromotionModel> {
        return this.promotionRepository.softDelete(id);
    }

    /**
     * Checked here as well as by the unique index, so the shop owner gets a plain
     * message instead of a duplicate-key error from the driver.
     */
    private async assertCodeIsFree(code?: string, selfId?: string): Promise<void> {
        if (!code) return;

        const existing = await this.promotionRepository.findByCode(code.trim().toUpperCase());

        if (existing && existing.promotionId !== selfId) {
            throw new BaseErrorException(
                `The coupon code ${code.trim().toUpperCase()} is already in use`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
