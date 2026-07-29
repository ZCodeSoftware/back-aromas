import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { CatOrderStatusModel } from "../../domain/models/cat-order-status.model";
import { ICatOrderStatusRepository } from "../../domain/repositories/cat-order-status.repository";
import { ICatOrderStatusService } from "../../domain/services/cat-order-status.service";
import { ICreateOrderStatus, IUpdateOrderStatus } from "../../domain/types/cat-order-status.type";
import SymbolsCatalogs from "../../symbols-catalogs";


/**
 * Unlike the other catalogues this one has no delete: the order state machine
 * lives in code and expects every OrderStatus code to exist, so a missing or
 * deactivated row would break checkout instead of hiding an option. Creating is
 * kept for the case of a fresh database whose seed has to be completed by hand.
 */
@Injectable()
export class CatOrderStatusService implements ICatOrderStatusService {
    constructor(
        @Inject(
            SymbolsCatalogs.ICatOrderStatusRepository
        ) private readonly catOrderStatusRepository: ICatOrderStatusRepository
    ) { }

    async create(orderStatus: ICreateOrderStatus): Promise<CatOrderStatusModel> {
        const existing = await this.catOrderStatusRepository.findByCode(orderStatus.code);

        if (existing) {
            throw new BaseErrorException(
                `Order status ${orderStatus.code} already exists`,
                HttpStatus.BAD_REQUEST,
            );
        }

        const catOrderStatusModel = CatOrderStatusModel.create(orderStatus);
        return await this.catOrderStatusRepository.create(catOrderStatusModel);
    }

    async findAll(): Promise<CatOrderStatusModel[]> {
        return await this.catOrderStatusRepository.findAll();
    }

    async findById(id: string): Promise<CatOrderStatusModel> {
        const orderStatus = await this.catOrderStatusRepository.findById(id);

        if (!orderStatus) throw new BaseErrorException('Order status not found', HttpStatus.NOT_FOUND);

        return orderStatus;
    }

    async update(id: string, orderStatus: IUpdateOrderStatus): Promise<CatOrderStatusModel> {
        const catOrderStatusModel = CatOrderStatusModel.create(orderStatus);
        return await this.catOrderStatusRepository.update(id, catOrderStatusModel);
    }
}
